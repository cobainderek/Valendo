import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

function getIsoWeekAndYear(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { year: d.getUTCFullYear(), week };
}

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  async submit(userId: bigint, dto: SubmitAnswerDto) {
    const questionId = BigInt(dto.questionId);

    // Buscar pergunta com duel
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { duel: true },
    });

    if (!question) {
      throw new NotFoundException('Pergunta não encontrada.');
    }

    // Verificar duplicata
    const existing = await this.prisma.answer.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      throw new ConflictException('Você já respondeu esta pergunta.');
    }

    const isCorrect = dto.selectedAnswer === question.correctAnswer;

    // Calcular XP
    let xpEarned = isCorrect ? 10 : 2;

    // Verificar streak no mesmo duel
    if (isCorrect) {
      const duelAnswers = await this.prisma.answer.findMany({
        where: {
          userId,
          question: { duelId: question.duelId },
        },
        orderBy: { answeredAt: 'desc' },
        take: 10,
      });

      let streak = 1; // inclui a resposta atual
      for (const a of duelAnswers) {
        if (a.isCorrect) {
          streak++;
        } else {
          break;
        }
      }

      if (streak >= 5) {
        xpEarned += 5;
      }
    }

    // Criar resposta e atualizar scores em transação
    const { year, week } = getIsoWeekAndYear(new Date());

    const answer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.answer.create({
        data: {
          userId,
          questionId,
          selectedAnswer: dto.selectedAnswer,
          isCorrect,
        },
      });

      await tx.weeklyScore.upsert({
        where: { userId_year_week: { userId, year, week } },
        update: { xp: { increment: xpEarned } },
        create: { userId, year, week, xp: xpEarned },
      });

      await tx.user.update({
        where: { id: userId },
        data: { globalXp: { increment: xpEarned } },
      });

      return created;
    });

    return {
      answerId: answer.id.toString(),
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanationAi: question.explanationAi,
      xpEarned,
    };
  }
}
