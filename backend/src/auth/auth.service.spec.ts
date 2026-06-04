import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

// Mocks de módulo precisam vir ANTES do import do service (hoisted pelo Jest).
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hash'),
  compare: jest.fn(),
}));

const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('jwt-do-valendo'),
  };

  const usuarioDb = {
    id: BigInt(1),
    name: 'Derek',
    tag: 'derek',
    email: 'derek@faesa.br',
    passwordHash: 'hash-bcrypt',
    globalXp: 100,
    role: 'user',
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'client-id-teste';
    service = new AuthService(usersService as never, jwtService as never);
  });

  function mockPayloadGoogle(payload: Record<string, unknown> | undefined) {
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => payload });
  }

  describe('login (email/senha)', () => {
    it('retorna token e usuário sem passwordHash quando a senha confere', async () => {
      usersService.findByEmail.mockResolvedValue(usuarioDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.login({
        email: 'derek@faesa.br',
        password: '123456',
      });

      expect(res.access_token).toBe('jwt-do-valendo');
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: BigInt(1), tag: 'derek' }),
      );
    });

    it('rejeita com 401 quando a senha está errada', async () => {
      usersService.findByEmail.mockResolvedValue(usuarioDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'derek@faesa.br', password: 'errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('loginComGoogle', () => {
    it('rejeita com 503 quando GOOGLE_CLIENT_ID não está configurado', async () => {
      delete process.env.GOOGLE_CLIENT_ID;

      await expect(service.loginComGoogle('token')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('rejeita com 401 quando o token do Google é inválido', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('assinatura inválida'));

      await expect(service.loginComGoogle('token-falso')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejeita com 401 quando o e-mail do Google não é verificado', async () => {
      mockPayloadGoogle({
        email: 'derek@faesa.br',
        email_verified: false,
      });

      await expect(service.loginComGoogle('token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('loga na conta existente (vínculo por e-mail) sem criar usuário', async () => {
      mockPayloadGoogle({
        email: 'derek@faesa.br',
        email_verified: true,
        name: 'Derek Silva',
      });
      usersService.findByEmail.mockResolvedValue(usuarioDb);

      const res = await service.loginComGoogle('token-valido');

      expect(usersService.create).not.toHaveBeenCalled();
      expect(res.access_token).toBe('jwt-do-valendo');
      expect(res.user).not.toHaveProperty('passwordHash');
      expect(mockVerifyIdToken).toHaveBeenCalledWith({
        idToken: 'token-valido',
        audience: 'client-id-teste',
      });
    });

    it('cria conta nova com apelido do Google e senha aleatória', async () => {
      mockPayloadGoogle({
        email: 'novo@gmail.com',
        email_verified: true,
        name: 'Novo Usuário',
        given_name: 'Novo',
      });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: BigInt(2),
        name: 'Novo Usuário',
        tag: 'Novo',
        email: 'novo@gmail.com',
        globalXp: 0,
        role: 'user',
      });

      const res = await service.loginComGoogle('token-valido');

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Novo Usuário',
          tag: 'Novo',
          email: 'novo@gmail.com',
          // Senha aleatória de 32 bytes em hex — login por senha desativado.
          password: expect.stringMatching(/^[0-9a-f]{64}$/),
        }),
      );
      expect(res.access_token).toBe('jwt-do-valendo');
    });

    it('usa o começo do e-mail como apelido quando o Google não manda nome', async () => {
      mockPayloadGoogle({ email: 'fulano@gmail.com', email_verified: true });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: BigInt(3),
        name: 'fulano',
        tag: 'fulano',
        email: 'fulano@gmail.com',
        globalXp: 0,
        role: 'user',
      });

      await service.loginComGoogle('token-valido');

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'fulano', tag: 'fulano' }),
      );
    });
  });
});
