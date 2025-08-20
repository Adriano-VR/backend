import { IsOptional, IsObject, IsEnum } from 'class-validator';

export enum HistoryType {
  feeling = 'feeling',
}

export class UpdateHistoryDto {
  @IsOptional()
  @IsEnum(HistoryType)
  type?: HistoryType;

  @IsOptional()
  @IsObject()
  data?: {
    frequency?: number;
    label?: string;
    emotion?: string;
    lifeView?: string;
    godView?: string;
    process?: string;
  };
}
