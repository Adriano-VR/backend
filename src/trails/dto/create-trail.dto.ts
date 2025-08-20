import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTrailDto {
  @ApiProperty({
    description: 'Título da trilha',
    example: 'Trilha de Desenvolvimento Web',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição da trilha',
    example: 'Uma trilha completa para aprender desenvolvimento web',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Slug único da trilha',
    example: 'trilha-desenvolvimento-web-123456',
  })
  @IsString()
  slug: string;
}
