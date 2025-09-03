import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

export enum CampaignFrequency {
  SEMESTRAL = 'semestral',
  ANUAL = 'anual',
  TRIMESTRAL = 'trimestral',
  MENSAL = 'mensal',
}

export enum CampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CampaignFrequency)
  frequency: CampaignFrequency;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(CampaignStatus)
  status: CampaignStatus;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}


