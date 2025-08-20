import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Nome do grupo',
    example: 'Grupo de Desenvolvimento',
    maxLength: 255,
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'ID do usuário que está criando o grupo',
    example: '66081253-2b4c-484b-85bc-fb06b29d613e',
    required: false,
  })
  @IsString({ message: 'createdById deve ser uma string' })
  @IsOptional()
  createdById?: string;

  @ApiProperty({
    description: 'ID das organizações às quais o grupo pertence',
    example: ['uuid-da-organizacao-1', 'uuid-da-organizacao-2'],
    required: false,
  })
  @IsArray({ message: 'organizationIds deve ser um array' })
  @IsOptional()
  organizationIds?: string[];
}
