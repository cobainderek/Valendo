import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString({ message: 'O tema deve ser um texto válido' })
  @IsOptional()
  @MaxLength(255, { message: 'O tema pode ter no máximo 255 caracteres' })
  theme?: string;

  @IsBoolean({ message: 'O campo de privacidade deve ser um booleano' })
  @IsOptional()
  isPrivate?: boolean;
}
