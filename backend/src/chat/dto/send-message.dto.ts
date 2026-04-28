import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Mensagem não pode ser vazia.' })
  @MaxLength(2000, { message: 'Mensagem muito longa (máx 2000 caracteres).' })
  text: string;
}
