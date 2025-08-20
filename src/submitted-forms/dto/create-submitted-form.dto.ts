import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum FormStatus {
  pending = 'pending',
  in_progress = 'in_progress',
  completed = 'completed',
}

export class CreateSubmittedFormDto {
  @ApiPropertyOptional({
    description: 'Status do formulário submetido',
    enum: FormStatus,
    example: FormStatus.pending,
    default: FormStatus.pending,
  })
  @IsOptional()
  @IsEnum(FormStatus)
  status?: FormStatus;

  @ApiPropertyOptional({
    description: 'Data de conclusão do formulário',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiProperty({
    description: 'ID do formulário que foi submetido',
    example: 'uuid-do-formulario',
  })
  @IsString()
  formId: string;

  @ApiPropertyOptional({
    description: 'Data de início do preenchimento',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({
    description: 'ID do perfil/usuário que submeteu o formulário',
    example: 'uuid-do-perfil',
  })
  @IsString()
  profileId: string;
}
