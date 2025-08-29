import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum FormApplicationFrequency {
  mensal = 'mensal',
  trimestral = 'trimestral',
  semestral = 'semestral',
  anual = 'anual',
}

export class UpdateOrganizationSettingsDto {
  @ApiPropertyOptional({
    description: 'Frequência de aplicação dos formulários',
    enum: FormApplicationFrequency,
    example: FormApplicationFrequency.semestral,
    default: FormApplicationFrequency.semestral,
  })
  @IsOptional()
  @IsEnum(FormApplicationFrequency)
  formApplicationFrequency?: FormApplicationFrequency;

  @ApiPropertyOptional({
    description: 'Outras configurações da organização',
    example: { theme: 'dark', notifications: true },
  })
  @IsOptional()
  settings?: any;
}
