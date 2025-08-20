import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserWithOrganizationDto {
  @IsString() @IsNotEmpty() organizationCnpj!: string;
  @IsString() @IsNotEmpty() organizationName!: string;

  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() password!: string;
  @IsString() @IsNotEmpty() cpf!: string;

  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsString() profilePhoto?: string;
}
