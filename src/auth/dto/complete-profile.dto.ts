// src/auth/dto/complete-profile.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from './role.enum';
import { Nr1Status } from './nr1-status.enum';

export class CompleteProfileDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  descricaoProfissional?: string;

  @IsOptional()
  @IsEnum(Nr1Status)
  nr1Status?: Nr1Status;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsEnum(Role)
  role!: Role; // permanece obrigatório para definir o fluxo após completar
}
