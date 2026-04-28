import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendFriendRequestDto {
  @IsString({ message: 'A tag deve ser um texto válido' })
  @IsNotEmpty({ message: 'A tag não pode estar vazia' })
  @MaxLength(50)
  tag: string;
}
