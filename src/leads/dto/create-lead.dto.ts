import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { LeadFormType } from '../../shared/lead-form-type';

export class CreateLeadDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString()
  nome!: string;

  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  email!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsNotEmpty({ message: 'O pageUrl é obrigatório.' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false, // <<< permite “localhost” sem TLD
    },
    { message: 'Formato de URL inválido.' },
  )
  pageUrl!: string;

  @IsNotEmpty({ message: 'O formType é obrigatório.' })
  @IsEnum(LeadFormType, { message: 'formType inválido.' })
  formType!: LeadFormType;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  payload?: Record<string, any>;
}
