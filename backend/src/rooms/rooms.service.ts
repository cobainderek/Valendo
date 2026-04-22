import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async create(hostId: bigint, createRoomDto: CreateRoomDto) {
    let code = this.generateRoomCode();
    let isUnique = false;
    let attempts = 0;

    // Retry loop para garantir código único
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

    const room = await this.prisma.room.create({
      data: {
        code,
        hostId,
        theme: createRoomDto.theme,
        isPrivate: createRoomDto.isPrivate ?? false,
        status: 'waiting',
      },
    });

    // Converter BigInt nativo para string no JSON de retorno
    return {
      ...room,
      id: room.id.toString(),
      hostId: room.hostId.toString(),
    };
  }

  async getLobbyRooms() {
    const rooms = await this.prisma.room.findMany({
      where: {
        status: 'waiting',
        isPrivate: false,
      },
      include: {
        host: {
          select: {
            name: true,
            tag: true,
            globalXp: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return rooms.map((room) => ({
      ...room,
      id: room.id.toString(),
      hostId: room.hostId.toString(),
    }));
  }
}
