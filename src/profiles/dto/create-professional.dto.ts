import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateProfessionalDto {
  @IsString() @IsNotEmpty() organizationCnpj!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() password!: string;
  @IsString() @IsNotEmpty() cpf!: string;
}
