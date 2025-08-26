import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from './role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  // -- Campos adicionais para COLABORADOR --

  @IsOptional()
  @IsObject()
  custom?: {
    organizationId?: string;
    role?: Role;
    departmentId?: string;
  };

  // -- Campos para GESTOR e PROFISSIONAL --

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  organizationSize?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  descricaoProfissional?: string;

  @IsOptional()
  @IsString()
  nr1Status?: string;
}
