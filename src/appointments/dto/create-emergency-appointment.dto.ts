import { IsString, IsOptional } from 'class-validator';

export class CreateEmergencyAppointmentDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;
}


