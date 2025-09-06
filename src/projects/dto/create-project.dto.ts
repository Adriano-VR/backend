import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';

export enum ProjectType {
  CHECKLIST = 'checklist',
  PREVENTIVO = 'preventivo',
  CONTIGENCIAL = 'contigencial',
}

export enum ProjectStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  problem?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsString()
  metrics?: string;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  resources?: string;

  @IsOptional()
  @IsString()
  risks?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;
}
