import { IsString, IsOptional } from 'class-validator';

export class CreateVirtualAgentAppointmentDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;
}


