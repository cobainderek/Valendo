import { UnauthorizedException } from '@nestjs/common';

// Os mocks de módulo precisam vir ANTES do import do service, porque o
// construtor instancia GoogleGenAI e Redis na hora.
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: { generateContent: mockGenerateContent },
  })),
  Type: {
    OBJECT: 'OBJECT',
    ARRAY: 'ARRAY',
    STRING: 'STRING',
  },
}));

const mockRedis = { get: jest.fn(), set: jest.fn() };
jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(() => mockRedis),
}));

import { QuestionsService } from './questions.service';

function criarPrismaMock() {
  return {
    room: { findUnique: jest.fn() },
    duel: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    question: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    answer: { deleteMany: jest.fn() },
  };
}

const PERGUNTAS_FAKE = [
  {
    text: 'Quanto é 2+2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanationAi: 'Aritmética básica.',
  },
  {
    text: 'Capital do Brasil?',
    options: ['Rio', 'SP', 'Brasília', 'BH'],
    correctAnswer: 'Brasília',
    explanationAi: 'Desde 1960.',
  },
  {
    text: 'H2O é?',
    options: ['Água', 'Ouro', 'Sal', 'Gás'],
    correctAnswer: 'Água',
    explanationAi: 'Fórmula química da água.',
  },
];

describe('QuestionsService — generateAndStore', () => {
  let prisma: ReturnType<typeof criarPrismaMock>;
  let service: QuestionsService;

  const sala = { id: 1n, hostId: 10n, code: 'ABC123' };
  const dto = { roomCode: 'ABC123', theme: 'matemática' };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = criarPrismaMock();
    service = new QuestionsService(prisma as any);
    // Cache do Redis devolve as perguntas prontas — evita o caminho do Gemini.
    mockRedis.get.mockResolvedValue(JSON.stringify(PERGUNTAS_FAKE));
  });

  it('bloqueia quem não é host da sala', async () => {
    prisma.room.findUnique.mockResolvedValue(sala);

    await expect(
      service.generateAndStore(99n, dto as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('cria o duelo com totalRounds = nº de perguntas quando não existe duelo', async () => {
    prisma.room.findUnique.mockResolvedValue(sala);
    prisma.duel.findUnique.mockResolvedValue(null);
    prisma.duel.create.mockResolvedValue({ id: 5n, roomId: 1n, totalRounds: 3 });

    await service.generateAndStore(10n, dto as any);

    expect(prisma.duel.create).toHaveBeenCalledWith({
      data: { roomId: 1n, totalRounds: PERGUNTAS_FAKE.length },
    });
    expect(prisma.question.createMany).toHaveBeenCalledTimes(1);
    const inserts = prisma.question.createMany.mock.calls[0][0].data;
    expect(inserts).toHaveLength(PERGUNTAS_FAKE.length);
    expect(inserts[0].duelId).toBe(5n);
  });

  it('re-geração SUBSTITUI as perguntas antigas em vez de acumular', async () => {
    prisma.room.findUnique.mockResolvedValue(sala);
    // Duelo já existia com 10 rounds de uma geração anterior.
    prisma.duel.findUnique.mockResolvedValue({ id: 5n, roomId: 1n, totalRounds: 10 });
    prisma.duel.update.mockResolvedValue({ id: 5n, roomId: 1n, totalRounds: 3 });

    await service.generateAndStore(10n, dto as any);

    // Limpa respostas e perguntas antigas...
    expect(prisma.answer.deleteMany).toHaveBeenCalledWith({
      where: { question: { duelId: 5n } },
    });
    expect(prisma.question.deleteMany).toHaveBeenCalledWith({
      where: { duelId: 5n },
    });
    // ...e o totalRounds vira o tamanho da NOVA leva (não 10 + 3).
    expect(prisma.duel.update).toHaveBeenCalledWith({
      where: { id: 5n },
      data: { totalRounds: PERGUNTAS_FAKE.length },
    });
    expect(prisma.duel.create).not.toHaveBeenCalled();
  });

  it('usa o cache do Redis sem chamar o Gemini quando há hit', async () => {
    prisma.room.findUnique.mockResolvedValue(sala);
    prisma.duel.findUnique.mockResolvedValue(null);
    prisma.duel.create.mockResolvedValue({ id: 6n, roomId: 1n, totalRounds: 3 });

    const resultado = await service.generateAndStore(10n, dto as any);

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(resultado.cachedHit).toBe(true);
  });
});
