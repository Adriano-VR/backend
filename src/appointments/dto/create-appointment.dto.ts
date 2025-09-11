import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['regular', 'emergency', 'virtual_agent'])
  appointmentType?: 'regular' | 'emergency' | 'virtual_agent';
}
