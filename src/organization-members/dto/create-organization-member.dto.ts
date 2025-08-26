import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum MemberRole {
  SUPER_ADMIN = 'super_admin',
  EXECUTIVE = 'executive',
  ADMIN = 'admin',
  COLLABORATOR = 'collaborator',
  PROFESSIONAL = 'professional',
  SUPPORT = 'support',
  PRESET = 'preset',
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REMOVED = 'removed',
}

export class CreateOrganizationMemberDto {
  @ApiProperty({
    description: 'ID do perfil do usuário',
    example: 'uuid-do-profile',
  })
  @IsString({ message: 'O ID do perfil deve ser uma string' })
  @IsNotEmpty({ message: 'O ID do perfil é obrigatório' })
  profileId: string;

  @ApiProperty({
    description: 'ID da organização',
    example: 'uuid-da-organizacao',
  })
  @IsString({ message: 'O ID da organização deve ser uma string' })
  @IsNotEmpty({ message: 'O ID da organização é obrigatório' })
  organizationId: string;

  @ApiProperty({
    description: 'Função do membro na organização',
    enum: MemberRole,
    example: MemberRole.COLLABORATOR,
    default: MemberRole.COLLABORATOR,
  })
  @IsEnum(MemberRole, { message: 'Role deve ser um valor válido' })
  @IsOptional()
  role?: MemberRole = MemberRole.COLLABORATOR;

  @ApiProperty({
    description: 'Status do membro na organização',
    enum: MemberStatus,
    example: MemberStatus.ACTIVE,
    default: MemberStatus.ACTIVE,
  })
  @IsEnum(MemberStatus, { message: 'Status deve ser um valor válido' })
  @IsOptional()
  status?: MemberStatus = MemberStatus.ACTIVE;
}
