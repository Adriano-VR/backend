import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({
    description: 'Título do formulário',
    example: 'Avaliação de Risco Psicossocial',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do formulário',
    example:
      'Formulário para avaliação de riscos psicossociais no ambiente de trabalho',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Instruções em markdown para o formulário',
    example:
      '**Instruções importantes:**\n\n- Responda todas as perguntas com atenção\n- Selecione apenas uma opção por questão\n- Não deixe perguntas em branco',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Indica se o formulário é um template',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'ID do usuário que criou o formulário',
    example: 'uuid-do-usuario',
  })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({
    description: 'ID da organização à qual o formulário pertence',
    example: 'uuid-da-organizacao',
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Data limite para responder o formulário',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  limitDate?: string;
}
