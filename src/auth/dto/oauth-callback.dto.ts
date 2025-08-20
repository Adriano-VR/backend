import { Role } from '@prisma/client';
import { IsObject } from 'class-validator';

export interface OAuthUser {
  id: string;
  email?: string;
  user_metadata: {
    name?: string;
    role?: string;
  };
  custom?: {
    role?: Role;
    organizationId?: string;
  };
}

export interface OAuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class OAuthCallbackDto {
  /** o objeto de usuário retornado pelo OAuth */
  @IsObject()
  user!: OAuthUser;

  /** a sessão ativa (contém access_token, refresh_token etc) */
  @IsObject()
  session!: OAuthSession;
}
