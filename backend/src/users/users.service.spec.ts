import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

// bcrypt real é lento e tem propriedades não-configuráveis (spyOn falha) —
// mocka o módulo inteiro pra manter os testes rápidos e determinísticos.
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt-fake'),
  hash: jest.fn().mockResolvedValue('hash-fake'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { UsersService } from './users.service';

// Mock mínimo do PrismaService — só os métodos que o UsersService usa.
function criarPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

describe('UsersService', () => {
  let prisma: ReturnType<typeof criarPrismaMock>;
  let service: UsersService;

  beforeEach(() => {
    prisma = criarPrismaMock();
    service = new UsersService(prisma as any);
  });

  describe('create (registro)', () => {
    const dto = {
      name: 'Derek',
      tag: 'derek',
      email: 'derek@faesa.br',
      password: 'senha123',
    };

    it('lança ConflictException com mensagem de e-mail quando o e-mail já existe', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1n, email: dto.email });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1n, email: dto.email });
      await expect(service.create(dto as any)).rejects.toThrow(
        'Este e-mail já está em uso.',
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('gera tag única com sufixo #NNNN quando a tag base já está em uso', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // e-mail livre
        .mockResolvedValueOnce({ id: 2n, tag: 'derek' }) // tag base ocupada
        .mockResolvedValueOnce(null); // primeiro candidato com sufixo livre

      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 3n, ...data }),
      );

      const resultado = await service.create(dto as any);

      expect(resultado.tag).toMatch(/^derek#\d{4}$/);
      // O hash NUNCA pode vazar na resposta.
      expect((resultado as any).passwordHash).toBeUndefined();
    });

    it('cria o usuário com a tag original quando está livre', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // e-mail livre
        .mockResolvedValueOnce(null); // tag livre

      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 4n, ...data }),
      );

      const resultado = await service.create(dto as any);

      expect(resultado.tag).toBe('derek');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Derek',
          tag: 'derek',
          email: 'derek@faesa.br',
          passwordHash: 'hash-fake',
        },
      });
    });

    it('trunca a base da tag pra caber no VarChar(50) com o sufixo', async () => {
      const tagGigante = 'a'.repeat(80);
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // e-mail livre
        .mockResolvedValueOnce({ id: 5n }) // base truncada ocupada
        .mockResolvedValueOnce(null); // candidato livre

      prisma.user.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 6n, ...data }),
      );

      const resultado = await service.create({ ...dto, tag: tagGigante } as any);

      // 45 da base + '#' + 4 dígitos = 50.
      expect(resultado.tag.length).toBeLessThanOrEqual(50);
      expect(resultado.tag).toMatch(/^a{45}#\d{4}$/);
    });
  });

  describe('update (perfil)', () => {
    const usuarioAtual = {
      id: 10n,
      name: 'Derek',
      tag: 'derek',
      email: 'derek@faesa.br',
      passwordHash: 'hash-existente',
    };

    it('lança ConflictException quando a nova tag já pertence a outro usuário', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(usuarioAtual) // findUnique por id
        .mockResolvedValueOnce({ id: 99n, tag: 'mari' }); // tag ocupada

      await expect(
        service.update(10n, { tag: 'mari' } as any),
      ).rejects.toThrow(ConflictException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('exige a senha atual pra trocar de senha', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(usuarioAtual);

      await expect(
        service.update(10n, { newPassword: 'novaSenha123' } as any),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
