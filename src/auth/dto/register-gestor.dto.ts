import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Role } from './role.enum';
import { Nr1Status } from './nr1-status.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsEnum(Nr1Status)
  nr1Status?: Nr1Status;

  @IsOptional()
  @IsNumber()
  organizationSize?: number;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  descricaoProfissional?: string;
}
