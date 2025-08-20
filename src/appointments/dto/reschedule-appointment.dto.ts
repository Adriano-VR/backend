import { IsString, IsDateString } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsDateString()
  novaData: string;

  @IsString()
  novoHorario: string;
}
