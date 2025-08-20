import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Título da lição',
    example: 'Introdução ao React Hooks',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Conteúdo da lição',
    example: 'Nesta lição você aprenderá sobre React Hooks...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'ID do módulo ao qual a lição pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  moduleId: string;

  @ApiProperty({
    description: 'Slug único da lição',
    example: 'introducao-ao-react-hooks-123456',
  })
  @IsString()
  slug: string;
}
