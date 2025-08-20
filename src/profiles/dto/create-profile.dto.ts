import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Role } from '../../auth/dto/role.enum';

export class CreateProfileDto {
  @ApiProperty({
    description: 'ID único do perfil (geralmente do Supabase)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email único do usuário',
    example: 'joao.silva@empresa.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Slug único gerado automaticamente',
    example: 'joao-silva-12345678',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Role do usuário no sistema',
    enum: Role,
    example: Role.collaborator,
    default: Role.collaborator,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    description: 'CPF do usuário',
    example: '12345678901',
  })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({
    description: 'WhatsApp do usuário',
    example: '+5511999999999',
  })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'Nome de exibição',
    example: 'João',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Biografia do usuário',
    example: 'Especialista em segurança do trabalho',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Cargo/função do usuário',
    example: 'Técnico em Segurança do Trabalho',
  })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Se o onboarding foi concluído',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  completedOnboarding?: boolean;

  @ApiPropertyOptional({
    description: 'Se o email foi confirmado',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  emailConfirmed?: boolean;

  @ApiPropertyOptional({
    description: 'ID do departamento',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Configurações do usuário em JSON',
    example: { theme: 'dark', notifications: true },
  })
  @IsOptional()
  settings?: any;
}

export { Role };
