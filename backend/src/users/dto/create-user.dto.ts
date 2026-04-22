import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O campo nome não pode estar vazio' })
  @MaxLength(255, { message: 'O nome pode ter no máximo 255 caracteres' })
  name: string;

  @IsString({ message: 'A tag deve ser um texto válido' })
  @IsNotEmpty({ message: 'A tag não pode estar vazia' })
  @MaxLength(50, { message: 'A tag pode ter no máximo 50 caracteres' })
  tag: string;

  @IsEmail({}, { message: 'O formato do e-mail é inválido' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio' })
  @MaxLength(255, { message: 'O e-mail pode ter no máximo 255 caracteres' })
  email: string;

  @IsString({ message: 'A senha deve ser um texto válido' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(255, { message: 'A senha pode ter no máximo 255 caracteres' })
  password: string;
}
