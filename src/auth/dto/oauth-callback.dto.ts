import { Role } from '@prisma/client';
import { IsObject, IsString, IsOptional, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class OAuthUserMetadata {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  iss?: string;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;

  @IsOptional()
  @IsString()
  phone_number_verified?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  provider_id?: string;

  @IsOptional()
  @IsString()
  sub?: string;
}

export class OAuthUserCustom {
  @IsOptional()
  role?: Role;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class OAuthUser {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @ValidateNested()
  @Type(() => OAuthUserMetadata)
  user_metadata!: OAuthUserMetadata;

  @IsOptional()
  @ValidateNested()
  @Type(() => OAuthUserCustom)
  custom?: OAuthUserCustom;
}

export class OAuthSession {
  @IsString()
  access_token!: string;

  @IsString()
  refresh_token!: string;

  @IsNumber()
  expires_at!: number;
}

export class OAuthCallbackDto {
  /** o objeto de usuário retornado pelo OAuth */
  @ValidateNested()
  @Type(() => OAuthUser)
  user!: OAuthUser;

  /** a sessão ativa (contém access_token, refresh_token etc) */
  @ValidateNested()
  @Type(() => OAuthSession)
  session!: OAuthSession;
}
