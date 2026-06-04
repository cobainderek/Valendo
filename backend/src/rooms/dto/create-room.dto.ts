import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString({ message: 'O tema deve ser um texto válido' })
  @IsOptional()
  @MaxLength(255, { message: 'O tema pode ter no máximo 255 caracteres' })
  theme?: string;

  @IsBoolean({ message: 'O campo de privacidade deve ser um booleano' })
  @IsOptional()
  isPrivate?: boolean;

  @IsInt({ message: 'O número máximo de jogadores deve ser um inteiro' })
  @IsOptional()
  @Min(2, { message: 'Mínimo de 2 jogadores' })
  @Max(10, { message: 'Máximo de 10 jogadores' })
  maxPlayers?: number;

  @IsBoolean({ message: 'O campo solo deve ser um booleano' })
  @IsOptional()
  isSoloMode?: boolean;

  @IsInt({ message: 'O tempo por pergunta deve ser um inteiro (segundos)' })
  @IsOptional()
  @Min(10, { message: 'Mínimo de 10 segundos por pergunta' })
  @Max(60, { message: 'Máximo de 60 segundos por pergunta' })
  questionTime?: number;
}
