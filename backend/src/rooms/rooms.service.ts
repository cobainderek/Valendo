import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsService } from '../questions/questions.service';
import { CreateRoomDto } from './dto/create-room.dto';

function getIsoWeekAndYear(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private questionsService: QuestionsService,
  ) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private serializeRoom(room: any) {
    return {
      ...room,
      id: room.id?.toString(),
      hostId: room.hostId?.toString(),
      winnerId: room.winnerId?.toString() || null,
    };
  }

  async create(hostId: bigint, dto: CreateRoomDto) {
    let code = this.generateRoomCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await this.prisma.room.findUnique({ where: { code } });
      if (existing) {
        code = this.generateRoomCode();
        attempts++;
      } else {
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new InternalServerErrorException('Não foi possível gerar um código único para a sala');
    }

    const isSolo = dto.isSoloMode ?? false;

    const room = await this.prisma.room.create({
      data: {
        code,
        hostId,
        theme: dto.theme,
        isPrivate: dto.isPrivate ?? false,
        isSoloMode: isSolo,
        maxPlayers: isSolo ? 2 : (dto.maxPlayers ?? 4),
        status: 'waiting',
      },
    });

    // Auto-add host as player
    await this.prisma.roomPlayer.create({
      data: { roomId: room.id, userId: hostId },
    });

    // Se solo, adicionar bot como segundo player
    if (isSolo) {
      await this.prisma.roomPlayer.create({
        data: {
          roomId: room.id,
          userId: hostId, // reusar userId do host — isBot diferencia
          isBot: true,
          botName: 'Valdo Bot',
        },
      });
    }

    return this.serializeRoom(room);
  }

  async getLobbyRooms() {
    const rooms = await this.prisma.room.findMany({
      where: { status: 'waiting', isPrivate: false, isSoloMode: false },
      include: {
        host: { select: { name: true, tag: true, globalXp: true } },
        _count: { select: { players: true } },
      },
      orderBy: { id: 'desc' },
    });

    return rooms.map((room) => ({
      ...this.serializeRoom(room),
      playerCount: room._count.players,
    }));
  }

  async getRoomByCode(code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        host: { select: { name: true, tag: true, globalXp: true } },
        players: {
          include: {
            user: { select: { id: true, name: true, tag: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        duel: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                options: true,
                // correctAnswer omitido quando playing — incluso quando finished
                explanationAi: true,
              },
            },
          },
        },
      },
    });

    if (!room) throw new NotFoundException('Sala não encontrada.');

    const serialized: any = {
      ...this.serializeRoom(room),
      isSoloMode: room.isSoloMode,
      players: room.players.map((p) => ({
        id: p.isBot ? `bot-${p.id}` : p.user.id.toString(),
        tag: p.isBot ? (p.botName || 'Valdo Bot') : p.user.tag,
        name: p.isBot ? (p.botName || 'Valdo Bot') : p.user.name,
        score: p.score,
        correct: p.correct,
        finished: p.finished,
        isBot: p.isBot,
      })),
      host: room.host,
      maxPlayers: room.maxPlayers,
      startedAt: room.startedAt,
      finishedAt: room.finishedAt,
    };

    if (room.duel) {
      serialized.duelId = room.duel.id.toString();
      serialized.totalRounds = room.duel.totalRounds;
      serialized.questions = room.duel.questions.map((q) => ({
        id: q.id.toString(),
        text: q.text,
        options: q.options,
        ...(room.status === 'finished' ? { explanationAi: q.explanationAi } : {}),
      }));
    }

    return serialized;
  }

  async joinRoom(userId: bigint, code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { _count: { select: { players: true } } },
    });

    if (!room) throw new NotFoundException('Sala não encontrada.');
    if (room.status !== 'waiting') throw new BadRequestException('Esta sala já iniciou ou terminou.');
    if (room._count.players >= room.maxPlayers) throw new BadRequestException('Sala cheia.');

    const existing = await this.prisma.roomPlayer.findUnique({
      where: { roomId_userId_isBot: { roomId: room.id, userId, isBot: false } },
    });

    if (existing) throw new ConflictException('Você já está nesta sala.');

    await this.prisma.roomPlayer.create({
      data: { roomId: room.id, userId },
    });

    return this.getRoomByCode(code);
  }

  async startGame(userId: bigint, code: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { _count: { select: { players: true } } },
    });

    if (!room) throw new NotFoundException('Sala não encontrada.');
    if (room.hostId !== userId) throw new ForbiddenException('Apenas o host pode iniciar a partida.');
    if (room.status !== 'waiting') throw new BadRequestException('A partida já foi iniciada.');
    if (!room.isSoloMode && room._count.players < 2) throw new BadRequestException('Precisa de pelo menos 2 jogadores.');

    // Gerar perguntas via Gemini
    const questionResult = await this.questionsService.generateAndStore(
      userId,
      { roomCode: code, theme: room.theme || undefined },
    );

    // Atualizar status para playing
    await this.prisma.room.update({
      where: { code },
      data: { status: 'playing', startedAt: new Date() },
    });

    return this.getRoomByCode(code);
  }

  async submitAnswer(userId: bigint, code: string, questionId: string, selectedAnswer: string) {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { duel: { include: { questions: true } } },
    });

    if (!room) throw new NotFoundException('Sala não encontrada.');
    if (room.status !== 'playing') throw new BadRequestException('A partida não está em andamento.');

    const player = await this.prisma.roomPlayer.findUnique({
      where: { roomId_userId_isBot: { roomId: room.id, userId, isBot: false } },
    });

    if (!player) throw new ForbiddenException('Você não está nesta sala.');
    if (player.finished) throw new BadRequestException('Você já terminou esta partida.');

    const qId = BigInt(questionId);
    const question = room.duel?.questions.find((q) => q.id === qId);
    if (!question) throw new NotFoundException('Pergunta não encontrada nesta sala.');

    // Verificar se já respondeu esta pergunta
    const existingAnswer = await this.prisma.answer.findUnique({
      where: { userId_questionId: { userId, questionId: qId } },
    });
    if (existingAnswer) throw new ConflictException('Você já respondeu esta pergunta.');

    const isCorrect = selectedAnswer === question.correctAnswer;

    // XP base
    let xpEarned = isCorrect ? 10 : 2;

    // Streak check
    if (isCorrect) {
      const duelAnswers = await this.prisma.answer.findMany({
        where: { userId, question: { duelId: room.duel!.id } },
        orderBy: { answeredAt: 'desc' },
        take: 10,
      });
      let streak = 1;
      for (const a of duelAnswers) {
        if (a.isCorrect) streak++;
        else break;
      }
      if (streak >= 5) xpEarned += 5;
    }

    const { year, week } = getIsoWeekAndYear(new Date());
    const totalQuestions = room.duel!.questions.length;

    // Contar respostas já dadas + esta
    const answeredCount = await this.prisma.answer.count({
      where: { userId, question: { duelId: room.duel!.id } },
    });
    const isLastQuestion = answeredCount + 1 >= totalQuestions;

    // Transação: criar answer + atualizar scores
    await this.prisma.$transaction(async (tx) => {
      await tx.answer.create({
        data: { userId, questionId: qId, selectedAnswer, isCorrect },
      });

      const newScore = player.score + xpEarned;
      const newCorrect = player.correct + (isCorrect ? 1 : 0);

      await tx.roomPlayer.update({
        where: { id: player.id },
        data: {
          score: newScore,
          correct: newCorrect,
          finished: isLastQuestion,
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
    });

    // Simular resposta do bot se for solo
    if (room.isSoloMode) {
      await this.simulateBotAnswer(room.id, qId, room.duel!.questions, isLastQuestion);
    }

    // Se foi a última pergunta deste player, verificar se todos terminaram
    if (isLastQuestion) {
      await this.checkAndFinishGame(room.id, room.code);
    }

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanationAi: question.explanationAi,
      xpEarned,
      totalScore: player.score + xpEarned,
    };
  }

  private async simulateBotAnswer(roomId: bigint, questionId: bigint, allQuestions: any[], isHumanLastQuestion: boolean) {
    const botPlayer = await this.prisma.roomPlayer.findFirst({
      where: { roomId, isBot: true },
    });
    if (!botPlayer || botPlayer.finished) return;

    const question = allQuestions.find((q) => q.id === questionId);
    if (!question) return;

    // Bot acerta 60% das vezes (dificuldade média)
    const botCorrect = Math.random() < 0.6;
    const botXp = botCorrect ? 10 : 2;

    await this.prisma.roomPlayer.update({
      where: { id: botPlayer.id },
      data: {
        score: botPlayer.score + botXp,
        correct: botPlayer.correct + (botCorrect ? 1 : 0),
        finished: isHumanLastQuestion, // bot termina junto com o humano
      },
    });
  }

  private async checkAndFinishGame(roomId: bigint, code: string) {
    const players = await this.prisma.roomPlayer.findMany({
      where: { roomId },
    });

    const allFinished = players.every((p) => p.finished);
    if (!allFinished) return;

    // Determinar vencedor: maior score, desempate por mais acertos
    // Priorizar humanos em caso de empate exato com bot
    const sorted = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (a.isBot !== b.isBot) return a.isBot ? 1 : -1; // humano primeiro no empate
      return 0;
    });

    const winner = sorted[0];
    const winnerId = winner.isBot ? null : winner.userId; // bot vencendo = sem winner humano
    const { year, week } = getIsoWeekAndYear(new Date());

    await this.prisma.$transaction(async (tx) => {
      // Marcar sala como finished
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'finished', finishedAt: new Date(), winnerId },
      });

      // Bônus para todos: +20 por completar o duelo (bots não ganham XP real)
      for (const p of players) {
        const isWinner = p.userId === winnerId && !p.isBot;
        const bonus = isWinner ? 70 : 20; // winner: +50 + +20, others: +20

        await tx.roomPlayer.update({
          where: { id: p.id },
          data: { score: p.score + bonus },
        });

        // Bots não ganham XP real (WeeklyScore/globalXp)
        if (!p.isBot) {
          await tx.weeklyScore.upsert({
            where: { userId_year_week: { userId: p.userId, year, week } },
            update: { xp: { increment: bonus } },
            create: { userId: p.userId, year, week, xp: bonus },
          });

          await tx.user.update({
            where: { id: p.userId },
            data: { globalXp: { increment: bonus } },
          });
        }
      }
    });
  }
}
