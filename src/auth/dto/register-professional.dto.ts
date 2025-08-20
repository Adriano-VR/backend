import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum Nr1StatusEnum {
  NUNCA_OUVI = 'nunca_ouvi_falar',
  SABEMOS_NAO_FAZEMOS = 'sabemos_nao_fazemos',
  ESCOLHENDO = 'escolhendo_solucao',
  ATENDENDO = 'atendendo_exigencias',
}

export class RegisterProfessionalDto {
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
  whatsapp!: string;

  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @IsString()
  @IsNotEmpty()
  descricaoProfissional!: string;

  @IsEnum(Nr1StatusEnum)
  nr1Status!: Nr1StatusEnum;
}
