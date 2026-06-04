import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RoomsService } from './rooms.service';

function criarPrismaMock() {
  return {
    room: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    duel: { findUnique: jest.fn() },
  };
}

function criarQuestionsMock() {
  return { generateAndStore: jest.fn().mockResolvedValue({}) };
}

function criarGatewayMock() {
  return {
    emitDuelStart: jest.fn(),
    broadcastRoomState: jest.fn().mockResolvedValue(undefined),
  };
}

describe('RoomsService — startGame', () => {
  let prisma: ReturnType<typeof criarPrismaMock>;
  let questions: ReturnType<typeof criarQuestionsMock>;
  let gateway: ReturnType<typeof criarGatewayMock>;
  let service: RoomsService;

  const salaBase = {
    id: 1n,
    code: 'ABC123',
    hostId: 10n,
    status: 'waiting',
    isSoloMode: false,
    theme: 'biologia',
    _count: { players: 2 },
  };

  beforeEach(() => {
    prisma = criarPrismaMock();
    questions = criarQuestionsMock();
    gateway = criarGatewayMock();
    service = new RoomsService(prisma as any, questions as any, gateway as any);
    // getRoomByCode dispara várias queries próprias — não é o foco aqui.
    jest
      .spyOn(service, 'getRoomByCode')
      .mockResolvedValue({ code: 'ABC123', totalRounds: 10 } as any);
    prisma.room.update.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('NÃO regenera perguntas quando o duelo já tem perguntas (ex.: geradas via PDF)', async () => {
    prisma.room.findUnique.mockResolvedValue(salaBase);
    prisma.duel.findUnique.mockResolvedValue({
      id: 2n,
      _count: { questions: 10 },
    });

    await service.startGame(10n, 'ABC123');

    expect(questions.generateAndStore).not.toHaveBeenCalled();
    expect(prisma.room.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: 'ABC123' },
        data: expect.objectContaining({ status: 'playing' }),
      }),
    );
    expect(gateway.emitDuelStart).toHaveBeenCalled();
  });

  it('gera perguntas pelo tema quando o duelo ainda não existe', async () => {
    prisma.room.findUnique.mockResolvedValue(salaBase);
    prisma.duel.findUnique.mockResolvedValue(null);

    await service.startGame(10n, 'ABC123');

    expect(questions.generateAndStore).toHaveBeenCalledWith(10n, {
      roomCode: 'ABC123',
      theme: 'biologia',
    });
  });

  it('gera perguntas quando o duelo existe mas está sem perguntas', async () => {
    prisma.room.findUnique.mockResolvedValue(salaBase);
    prisma.duel.findUnique.mockResolvedValue({
      id: 2n,
      _count: { questions: 0 },
    });

    await service.startGame(10n, 'ABC123');

    expect(questions.generateAndStore).toHaveBeenCalledTimes(1);
  });

  it('só o host pode iniciar a partida', async () => {
    prisma.room.findUnique.mockResolvedValue(salaBase);

    await expect(service.startGame(99n, 'ABC123')).rejects.toThrow(
      ForbiddenException,
    );
    expect(questions.generateAndStore).not.toHaveBeenCalled();
  });

  it('não inicia uma sala que já está em jogo', async () => {
    prisma.room.findUnique.mockResolvedValue({
      ...salaBase,
      status: 'playing',
    });

    await expect(service.startGame(10n, 'ABC123')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('exige pelo menos 2 jogadores fora do modo solo', async () => {
    prisma.room.findUnique.mockResolvedValue({
      ...salaBase,
      _count: { players: 1 },
    });

    await expect(service.startGame(10n, 'ABC123')).rejects.toThrow(
      BadRequestException,
    );
  });
});
