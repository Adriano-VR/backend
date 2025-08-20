// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: { id: string; role: string; [key: string]: any };
}

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractTokenFromHeader(request: AuthenticatedRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    console.log('🔐 [AuthController] Recebida requisição de registro:', { email: dto.email });
    try {
      const result = await this.authService.register(dto);
      console.log('✅ [AuthController] Registro realizado com sucesso');
      return result;
    } catch (error) {
      console.error('❌ [AuthController] Erro no registro:', error);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log('🔐 [AuthController] Recebida requisição de login:', { email: dto.email });
    try {
      const result = await this.authService.login(dto);
      console.log('✅ [AuthController] Login realizado com sucesso');
      return result;
    } catch (error) {
      console.error('❌ [AuthController] Erro no login:', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Reenviar email de confirmação',
    description: 'Reenvia o email de confirmação para um usuário',
  })
  @Post('resend-confirmation')
  async resendConfirmationEmail(@Body() body: { email: string; password: string }) {
    console.log('📧 [Controller] Recebida requisição para reenviar email:', { email: body.email, password: '***' });
    
    try {
      const result = await this.authService.resendConfirmationEmail(body.email, body.password);
      console.log('✅ [Controller] Email reenviado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] Erro ao reenviar email:', error);
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    console.log(dto, 'dto-refresh-token');
    return this.authService.refleshToken(dto.token);
  }

  @Post('google')
  async signInWithGoogle() {
    console.log('🔐 [Controller] Recebendo requisição de login com Google');
    return this.authService.signInWithGoogle();
  }

  @Post('oauth/callback')
  async oauthCallback(@Body() dto: OAuthCallbackDto) {
    return this.authService.handleOAuthCallback(dto);
  }

  @UseGuards(AuthGuard)
  @Post('complete-profile')
  async completeProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.authService.completeProfile(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() req: AuthenticatedRequest) {
    // Extrair o token do header Authorization
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Token não encontrado');
    }

    return this.authService.getProfile(token);
  }

  @ApiOperation({
    summary: 'Verificar usuário Supabase',
    description: 'Verifica e retorna informações completas de um usuário autenticado via Supabase',
  })
  @Post('verify-supabase-user')
  async verifySupabaseUser(@Body() body: { supabaseUserId: string; email: string }) {
    console.log('🔍 [Controller] Verificando usuário Supabase:', { supabaseUserId: body.supabaseUserId, email: body.email });
    
    try {
      const result = await this.authService.verifySupabaseUser(body.supabaseUserId, body.email);
      console.log('✅ [Controller] Usuário Supabase verificado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] Erro ao verificar usuário Supabase:', error);
      throw error;
    }
  }
}
