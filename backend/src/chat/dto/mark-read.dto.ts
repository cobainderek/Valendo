import { IsNotEmpty, IsString } from 'class-validator';

export class MarkReadDto {
  @IsString()
  @IsNotEmpty()
  lastMessageId: string;
}
