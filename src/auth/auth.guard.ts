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

    // Log para debug
    console.log('🔍 [AuthGuard] Verificando rota:', request.url);
    console.log('🔍 [AuthGuard] Método:', request.method);
    console.log('🔍 [AuthGuard] Token presente:', !!token);

    // Se não há token, bloquear acesso (rota protegida)
    if (!token) {
      console.log('❌ [AuthGuard] Token não encontrado, bloqueando acesso');
      throw new UnauthorizedException('Token de autenticação é obrigatório');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });

      console.log('✅ [AuthGuard] Token válido, permitindo acesso');
      request['user'] = payload;
    } catch (error) {
      console.log('❌ [AuthGuard] Token inválido:', error.message);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
