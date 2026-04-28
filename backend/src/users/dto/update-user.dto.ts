import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto válido' })
  @MaxLength(255, { message: 'O nome pode ter no máximo 255 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'A tag deve ser um texto válido' })
  @MaxLength(50, { message: 'A tag pode ter no máximo 50 caracteres' })
  tag?: string;

  // currentPassword é obrigatório se newPassword for enviado
  @ValidateIf((o) => o.newPassword !== undefined && o.newPassword !== null)
  @IsString({ message: 'A senha atual deve ser um texto válido' })
  @MinLength(6, { message: 'A senha atual deve ter no mínimo 6 caracteres' })
  currentPassword?: string;

  @IsOptional()
  @IsString({ message: 'A nova senha deve ser um texto válido' })
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  @MaxLength(255, { message: 'A nova senha pode ter no máximo 255 caracteres' })
  newPassword?: string;
}
