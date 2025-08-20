import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Título do módulo',
    example: 'Introdução ao React',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição do módulo',
    example: 'Aprenda os fundamentos do React',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID do curso ao qual o módulo pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  courseId: string;

  @ApiProperty({
    description: 'Slug único do módulo',
    example: 'introducao-ao-react-123456',
  })
  @IsString()
  slug: string;
}
