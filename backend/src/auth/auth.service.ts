import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // Client usado só pra VERIFICAR ID tokens (assinatura + audience).
  // Não precisa de client_secret — o fluxo é todo no frontend (GIS).
  private readonly googleClient = new OAuth2Client();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    return this.emitirToken(user);
  }

  /**
   * Login com Google (Google Identity Services).
   * O frontend manda o ID Token do popup; aqui validamos a assinatura e o
   * audience com a lib oficial e fazemos find-or-create pelo e-mail.
   */
  async loginComGoogle(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new ServiceUnavailableException(
        'Login com Google não está configurado neste servidor.',
      );
    }

    let payload: TokenPayload | undefined;
    try {
      payload = await this.verificarTokenGoogle(idToken, clientId);
    } catch {
      throw new UnauthorizedException('Token do Google inválido ou expirado.');
    }

    if (!payload?.email || payload.email_verified !== true) {
      throw new UnauthorizedException(
        'Sua conta Google precisa ter um e-mail verificado.',
      );
    }

    const existente = await this.usersService.findByEmail(payload.email);
    if (existente) {
      // Vínculo por e-mail: o Google já provou a posse da conta.
      const { passwordHash, ...user } = existente;
      return this.emitirToken(user);
    }

    // Conta nova: apelido vem do nome do Google (ou do começo do e-mail) e a
    // senha é um segredo aleatório impossível de adivinhar — login por senha
    // fica naturalmente desativado até o usuário definir uma no perfil.
    const apelido =
      payload.given_name?.trim() ||
      payload.name?.trim() ||
      payload.email.split('@')[0];

    const novo = await this.usersService.create({
      name: payload.name?.trim() || apelido,
      tag: apelido,
      email: payload.email,
      password: crypto.randomBytes(32).toString('hex'),
    });

    return this.emitirToken(novo);
  }

  private async verificarTokenGoogle(idToken: string, clientId: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    return ticket.getPayload();
  }

  private emitirToken(user: {
    id: bigint;
    email: string;
    tag: string;
    role: string;
  }) {
    const payload = {
      email: user.email,
      sub: user.id,
      tag: user.tag,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
