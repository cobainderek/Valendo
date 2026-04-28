import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoverDto {
  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  @IsNotEmpty({ message: 'E-mail não pode estar vazio' })
  email: string;
}
