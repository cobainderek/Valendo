import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateQuestionsDto {
  @IsString({ message: 'O tema da geração deve ser uma string válida.' })
  @IsOptional()
  theme?: string;
  
  @IsString({ message: 'O código da sala é obrigatório.' })
  @IsNotEmpty({ message: 'Informe a sala da qual geraremos o duelo e questões.' })
  roomCode: string;
}

