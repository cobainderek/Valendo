import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RecoverDto } from './dto/recover.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Throttle agressivo: trava brute-force / credential stuffing por IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Login social: recebe o ID Token do Google Identity Services (popup no
  // frontend), valida e faz find-or-create do usuário pelo e-mail.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('google')
  @HttpCode(HttpStatus.OK)
  loginGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginComGoogle(dto.idToken);
  }

  // Placeholder seguro: sempre retorna { ok: true } para evitar
  // enumeração de e-mails. TODO: integrar com SMTP/SendGrid e enviar
  // link de reset assinado quando o e-mail existir.
  @Post('recover')
  @HttpCode(HttpStatus.OK)
  recover(@Body() _dto: RecoverDto) {
    return { ok: true };
  }
}
