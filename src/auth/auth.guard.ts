import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

@Injectable()
export class AuthGuard implements CanActivate {
  private jwtSecret: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('🔍 [AuthGuard] Verificando autenticação...');
    console.log('🔍 [AuthGuard] Token presente:', !!token);
    console.log('🔍 [AuthGuard] Headers authorization:', request.headers.authorization);

    if (!token) {
      console.log('❌ [AuthGuard] Token não encontrado');
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });

      console.log('✅ [AuthGuard] Token válido, payload:', payload);

      request['user'] = payload;
    } catch (error) {
      console.log('❌ [AuthGuard] Erro ao verificar token:', error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
