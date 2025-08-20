import { Expose } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '../../auth/dto/role.enum';

export class CreateCollaboratorDto {
  @Expose({ name: 'registration_code' })
  @IsString()
  @IsNotEmpty()
  registrationCode!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @Expose({ name: 'department_id' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
