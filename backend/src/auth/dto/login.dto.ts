import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  @IsNotEmpty({ message: 'E-mail não pode estar vazio' })
  email: string;

  @IsNotEmpty({ message: 'Senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
