import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CloneFormDto {
  @ApiProperty({
    description: 'ID da organização a ser clonado',
    example: 'uuid-da-organizacao',
  })
  @IsString()
  organizationId: string;

  @ApiProperty({
    description: 'IDs dos formulários template a ser clonado',
    example: ['uuid-do-formulário-template-1', 'uuid-do-formulário-template-2'],
  })
  @IsArray()
  @IsString({ each: true })
  templateFormIds: string[];

  @ApiProperty({
    description: 'Título do formulário clonado',
    example: 'Formulário clonado',
  })
  @IsString()
  createdById: string;

  @ApiPropertyOptional({
    description: 'Data limite para responder o formulário',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  limitDate?: string;
}
