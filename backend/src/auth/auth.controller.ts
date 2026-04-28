import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RecoverDto } from './dto/recover.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
