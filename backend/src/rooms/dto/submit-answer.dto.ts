import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SubmitAnswerDto {
  // ID da pergunta (BigInt serializado como string). Restringir a dígitos evita
  // que BigInt('abc')/undefined estoure 500 lá no service — agora vira 400.
  @IsString({ message: 'questionId deve ser um texto.' })
  @IsNotEmpty({ message: 'questionId é obrigatório.' })
  @Matches(/^\d+$/, { message: 'questionId inválido.' })
  questionId: string;

  @IsString({ message: 'selectedAnswer deve ser um texto.' })
  @IsNotEmpty({ message: 'selectedAnswer é obrigatório.' })
  selectedAnswer: string;
}
