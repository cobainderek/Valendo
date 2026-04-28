import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do grupo é obrigatório.' })
  @MaxLength(100)
  name: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Adicione pelo menos um membro além de você.' })
  @IsString({ each: true })
  memberIds: string[];
}
