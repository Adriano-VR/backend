import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Título do curso',
    example: 'Desenvolvimento Web com React',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição do curso',
    example: 'Aprenda a desenvolver aplicações web modernas com React',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID da trilha ao qual o curso pertence (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  trailId?: string;

  @ApiProperty({
    description: 'Slug único do curso',
    example: 'desenvolvimento-web-com-react-123456',
  })
  @IsString()
  slug: string;
}
