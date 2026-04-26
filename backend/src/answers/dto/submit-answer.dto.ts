import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitAnswerDto {
  @IsString({ message: 'O questionId deve ser um texto válido' })
  @IsNotEmpty({ message: 'O questionId não pode estar vazio' })
  questionId: string;

  @IsString({ message: 'A resposta deve ser um texto válido' })
  @IsNotEmpty({ message: 'A resposta não pode estar vazia' })
  selectedAnswer: string;
}
