import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, tag, email, password } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { tag }] },
    });

    if (existingUser) {
      throw new ConflictException('O e-mail ou a tag já estão em uso.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: { name, tag, email, passwordHash },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: bigint) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async getProfileWithStats(id: bigint) {
    const user = await this.findById(id);

    const [roomsHosted, finishedAsPlayer, correctAggregate] = await Promise.all(
      [
        this.prisma.room.count({ where: { hostId: id } }),
        this.prisma.roomPlayer.findMany({
          where: {
            userId: id,
            isBot: false,
            room: { status: 'finished' },
          },
          select: { correct: true, room: { select: { winnerId: true } } },
        }),
        this.prisma.answer.count({
          where: { userId: id, isCorrect: true },
        }),
      ],
    );

    const duelsPlayed = finishedAsPlayer.length;
    const duelsWon = finishedAsPlayer.filter((p) => p.room.winnerId === id)
      .length;

    return {
      ...user,
      stats: {
        roomsHosted,
        duelsPlayed,
        duelsWon,
        correctAnswersTotal: correctAggregate,
      },
    };
  }

  async update(id: bigint, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const data: {
      name?: string;
      tag?: string;
      passwordHash?: string;
    } = {};

    if (dto.name !== undefined) data.name = dto.name;

    if (dto.tag !== undefined && dto.tag !== user.tag) {
      const existingTag = await this.prisma.user.findUnique({
        where: { tag: dto.tag },
      });
      if (existingTag) {
        throw new ConflictException('Esta tag já está em uso.');
      }
      data.tag = dto.tag;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Informe a senha atual para alterar a senha.',
        );
      }
      const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!ok) {
        throw new UnauthorizedException('Senha atual incorreta.');
      }
      const salt = await bcrypt.genSalt();
      data.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    }

    if (Object.keys(data).length === 0) {
      // Nada pra atualizar — apenas devolve o perfil atual
      return this.getProfileWithStats(id);
    }

    await this.prisma.user.update({ where: { id }, data });
    return this.getProfileWithStats(id);
  }

  async getHistory(
    id: bigint,
    cursor: bigint | null,
    limit: number,
  ): Promise<{
    items: Array<{
      roomCode: string;
      theme: string | null;
      finishedAt: Date | null;
      score: number;
      correct: number;
      totalQuestions: number;
      isWinner: boolean;
    }>;
    nextCursor: string | null;
  }> {
    const players = await this.prisma.roomPlayer.findMany({
      where: {
        userId: id,
        isBot: false,
        room: { status: 'finished' },
      },
      include: {
        room: {
          include: {
            duel: { select: { totalRounds: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasNext = players.length > limit;
    const slice = hasNext ? players.slice(0, limit) : players;

    return {
      items: slice.map((p) => ({
        roomCode: p.room.code,
        theme: p.room.theme,
        finishedAt: p.room.finishedAt,
        score: p.score,
        correct: p.correct,
        totalQuestions: p.room.duel?.totalRounds ?? 0,
        isWinner: p.room.winnerId === id,
      })),
      nextCursor: hasNext ? slice[slice.length - 1].id.toString() : null,
    };
  }
}
