import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDmDto {
  @IsString()
  @IsNotEmpty({ message: 'userId é obrigatório.' })
  userId: string;
}
