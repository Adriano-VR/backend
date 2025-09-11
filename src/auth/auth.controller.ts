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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordConfirmDto } from './dto/reset-password-confirm.dto';

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
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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

  @ApiOperation({
    summary: 'Reset de senha',
    description: 'Envia email de reset de senha para o usuário',
  })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    console.log('🔐 [Controller] Recebida requisição de reset de senha:', { email: dto.email });
    
    try {
      await this.authService.resetPassword(dto.email);
      console.log('✅ [Controller] Reset de senha processado com sucesso');
      return { message: 'Email de reset de senha enviado com sucesso' };
    } catch (error) {
      console.error('❌ [Controller] Erro ao processar reset de senha:', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Confirmar reset de senha',
    description: 'Confirma o reset de senha com os tokens e define a nova senha',
  })
  @Post('reset-password-confirm')
  async resetPasswordConfirm(@Body() dto: ResetPasswordConfirmDto) {
    console.log('🔐 [Controller] Recebida confirmação de reset de senha');
    
    try {
      await this.authService.resetPasswordConfirm(dto.accessToken, dto.refreshToken, dto.password);
      console.log('✅ [Controller] Reset de senha confirmado com sucesso');
      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      console.error('❌ [Controller] Erro ao confirmar reset de senha:', error);
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

  @Post('google/collaborator')
  async signInWithGoogleCollaborator(@Body() dto: { organizationId: string }) {
    console.log('🔐 [Controller] Recebendo requisição de registro de colaborador via Google');
    console.log('🏢 [Controller] Organização:', dto.organizationId);
    return this.authService.signInWithGoogleCollaborator(dto.organizationId);
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
    console.log('🔍 [AuthController] complete-profile chamado');
    console.log('🔍 [AuthController] req.user:', req.user);
    console.log('🔍 [AuthController] dto:', dto);
    
    try {
      const result = await this.authService.completeProfile(req.user.id, dto);
      console.log('✅ [AuthController] complete-profile sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ [AuthController] complete-profile erro:', error);
      throw error;
    }
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

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfileRoute(@Request() req: AuthenticatedRequest) {
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
