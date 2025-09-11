// src/auth/dto/complete-profile.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from './role.enum';

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
  @IsString()
  registroProfissional?: string;

  @IsOptional()
  @IsString()
  especializacao?: string;

  @IsOptional()
  @IsString()
  experienciaAnos?: string;


  @IsOptional()
  @IsString()
  cpf?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role; // tornar opcional para evitar erro de validação
}
