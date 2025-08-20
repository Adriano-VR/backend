import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Nr1Status {
  never_heard_of_it = 'never_heard_of_it',
  we_know_but_dont_do = 'we_know_but_dont_do',
  choosing_solution = 'choosing_solution',
  meeting_requirements = 'meeting_requirements',
}

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Nome da organização',
    example: 'Empresa Tech LTDA',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia da organização',
    example: 'Tech Solutions',
  })
  @IsOptional()
  @IsString()
  fantasyName?: string;

  @ApiPropertyOptional({
    description: 'CNPJ da organização',
    example: '12.345.678/0001-90',
  })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({
    description: 'Email corporativo da organização',
    example: 'empresa@tech.com',
  })
  @IsString()
  corporateEmail: string;

  @ApiPropertyOptional({
    description: 'ID do usuário autenticado (Supabase)',
    example: 'uuid-do-usuario-supabase',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Número de funcionários',
    example: '50-100',
  })
  @IsOptional()
  @IsString()
  numberOfEmployees?: string;

  @ApiProperty({
    description: 'WhatsApp da organização',
    example: '+5511999999999',
  })
  @IsString()
  whatsapp: string;

  @ApiPropertyOptional({
    description: 'Tipo da organização',
    example: 'Tecnologia',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Data de abertura da empresa',
    example: '2020-01-15',
  })
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional({
    description: 'Situação da empresa',
    example: 'ATIVA',
  })
  @IsOptional()
  @IsString()
  situation?: string;

  @ApiPropertyOptional({
    description: 'Data da situação',
    example: '2020-01-15',
  })
  @IsOptional()
  @IsDateString()
  situationDate?: string;

  @ApiPropertyOptional({
    description: 'Situação especial',
    example: null,
  })
  @IsOptional()
  @IsString()
  situationSpecial?: string;

  @ApiPropertyOptional({
    description: 'Data da situação especial',
    example: null,
  })
  @IsOptional()
  @IsDateString()
  situationSpecialDate?: string;

  @ApiPropertyOptional({
    description: 'Natureza jurídica',
    example: 'Sociedade Empresária Limitada',
  })
  @IsOptional()
  @IsString()
  legalNature?: string;

  @ApiPropertyOptional({
    description: 'Porte da empresa',
    example: 'PEQUENO',
  })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional({
    description: 'Atividade principal (JSON)',
    example: [
      {
        code: '6201-5/00',
        text: 'Desenvolvimento de programas de computador sob encomenda',
      },
    ],
  })
  @IsOptional()
  mainActivity?: any;

  @ApiPropertyOptional({
    description: 'Atividades secundárias (JSON)',
    example: [
      {
        code: '6202-3/00',
        text: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
      },
    ],
  })
  @IsOptional()
  secondaryActivities?: any;

  @ApiPropertyOptional({
    description: 'Quadro de sócios e administradores (JSON)',
    example: [{ nome: 'João Silva', qual: 'Sócio-Administrador' }],
  })
  @IsOptional()
  qsa?: any;

  @ApiPropertyOptional({
    description: 'Capital social',
    example: '100000.00',
  })
  @IsOptional()
  @IsString()
  capitalStock?: string;

  @ApiPropertyOptional({
    description: 'EFR (Ente Federativo Responsável)',
    example: '***',
  })
  @IsOptional()
  @IsString()
  efr?: string;

  @ApiPropertyOptional({
    description: 'Status da empresa na Receita',
    example: 'OK',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Motivo da situação',
    example: null,
  })
  @IsOptional()
  @IsString()
  motiveSituation?: string;

  @ApiPropertyOptional({
    description: 'Data da última atualização na Receita',
    example: '2023-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastUpdate?: string;

  @ApiPropertyOptional({
    description: 'Informações de billing (JSON)',
    example: { free: true, database: true },
  })
  @IsOptional()
  billing?: any;

  @ApiPropertyOptional({
    description: 'Informações do Simples Nacional (JSON)',
    example: {
      optante: true,
      data_opcao: '2020-01-01',
      data_exclusao: null,
      ultima_atualizacao: '2023-12-31',
    },
  })
  @IsOptional()
  simples?: any;

  @ApiPropertyOptional({
    description: 'Informações do SIMEI (JSON)',
    example: {
      optante: false,
      data_opcao: null,
      data_exclusao: null,
      ultima_atualizacao: '2023-12-31',
    },
  })
  @IsOptional()
  simei?: any;

  @ApiPropertyOptional({
    description: 'Informações extras (JSON)',
    example: {},
  })
  @IsOptional()
  extra?: any;

  @ApiPropertyOptional({
    description: 'ID do endereço',
    example: 'uuid-do-endereco',
  })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({
    description: 'ID do criador da organização',
    example: 'uuid-do-criador',
  })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiProperty({
    description: 'Slug único da organização',
    example: 'empresa-tech-ltda',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Número de colaboradores',
    example: '45',
  })
  @IsOptional()
  @IsString()
  numberOfCollaborators?: string;

  @ApiPropertyOptional({
    description: 'Se completou o onboarding',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasCompletedOnboarding?: boolean;

  @ApiProperty({
    description: 'UUID da matriz',
    example: 'uuid-da-matriz',
  })
  @IsString()
  headOfficeUuid: string;

  @ApiPropertyOptional({
    description: 'Se a organização está ativa',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Status da NR1',
    enum: Nr1Status,
    example: Nr1Status.never_heard_of_it,
  })
  @IsEnum(Nr1Status)
  nr1Status: Nr1Status;

  @ApiPropertyOptional({
    description: 'Código de registro único',
    example: 'REG123456',
  })
  @IsOptional()
  @IsString()
  registrationCode?: string;

  @ApiPropertyOptional({
    description: 'Configurações da organização (JSON)',
    example: { theme: 'dark', notifications: true },
  })
  @IsOptional()
  settings?: any;

  @ApiPropertyOptional({
    description: 'ID do grupo ao qual pertence',
    example: 1,
  })
  @IsOptional()
  groupId?: number;
}
