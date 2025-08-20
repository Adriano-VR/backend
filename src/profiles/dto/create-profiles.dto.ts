import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsIn(['admin', 'rh', 'lider', 'colaborador'])
  role!: string;

  @IsOptional()
  @IsString()
  profile_photo?: string;
}
