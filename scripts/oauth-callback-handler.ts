/**
 * Script para implementar o tratamento do OAuth callback
 * Este script mostra como implementar o redirecionamento após confirmação de email
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuthCallbackService {
  constructor(private configService: ConfigService) {}

  /**
   * Processa o callback do OAuth e redireciona para o dashboard
   */
  async handleOAuthCallback(code: string, state?: string) {
    try {
      console.log('🔄 [OAuth] Processando callback:', { code, state });
      
      // 1. Validar o código de autorização
      if (!code) {
        throw new Error('Código de autorização não fornecido');
      }

      // 2. Trocar o código por um token de acesso
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      // 3. Obter informações do usuário
      const userInfo = await this.getUserInfo(tokenResponse.access_token);
      
      // 4. Processar o login/registro do usuário
      const authResult = await this.processUserAuthentication(userInfo);
      
      // 5. Redirecionar para o dashboard com token
      const redirectUrl = this.buildDashboardRedirectUrl(authResult.token);
      
      console.log('✅ [OAuth] Redirecionamento bem-sucedido para:', redirectUrl);
      
      return {
        success: true,
        redirectUrl,
        user: authResult.user
      };
      
    } catch (error) {
      console.error('❌ [OAuth] Erro no callback:', error);
      
      // Redirecionar para página de erro
      const errorUrl = this.buildErrorRedirectUrl(error.message);
      
      return {
        success: false,
        redirectUrl: errorUrl,
        error: error.message
      };
    }
  }

  /**
   * Troca o código de autorização por um token de acesso
   */
  private async exchangeCodeForToken(code: string) {
    const tokenUrl = 'https://api.supabase.com/auth/v1/token';
    const clientId = this.configService.get('SUPABASE_CLIENT_ID');
    const clientSecret = this.configService.get('SUPABASE_CLIENT_SECRET');
    const redirectUri = this.configService.get('OAUTH_REDIRECT_URI');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao trocar código por token');
    }

    return await response.json();
  }

  /**
   * Obtém informações do usuário usando o token de acesso
   */
  private async getUserInfo(accessToken: string) {
    const userUrl = 'https://api.supabase.com/auth/v1/user';
    
    const response = await fetch(userUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao obter informações do usuário');
    }

    return await response.json();
  }

  /**
   * Processa a autenticação do usuário
   */
  private async processUserAuthentication(userInfo: any) {
    // Aqui você implementaria a lógica para:
    // 1. Verificar se o usuário já existe no seu banco
    // 2. Criar o usuário se não existir
    // 3. Gerar um token JWT para sua aplicação
    // 4. Retornar o token e informações do usuário
    
    console.log('👤 [OAuth] Processando usuário:', userInfo.email);
    
    // Mock da implementação
    return {
      token: 'jwt_token_aqui',
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.user_metadata?.full_name || userInfo.email,
      }
    };
  }

  /**
   * Constrói a URL de redirecionamento para o dashboard
   */
  private buildDashboardRedirectUrl(token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://mentesegura.vercel.app';
    const dashboardUrl = `${frontendUrl}/dashboard`;
    
    // Adicionar o token como query parameter ou usar localStorage
    return `${dashboardUrl}?token=${encodeURIComponent(token)}`;
  }

  /**
   * Constrói a URL de redirecionamento para página de erro
   */
  private buildErrorRedirectUrl(errorMessage: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'https://mentesegura.vercel.app';
    const errorUrl = `${frontendUrl}/auth/error`;
    
    return `${errorUrl}?error=${encodeURIComponent(errorMessage)}`;
  }

  /**
   * Valida se o usuário tem acesso ao dashboard
   */
  async validateDashboardAccess(userId: string, organizationId?: string) {
    try {
      console.log('🔍 [Access] Validando acesso ao dashboard:', { userId, organizationId });
      
      // Implementar validação de acesso
      // 1. Verificar se o usuário está ativo
      // 2. Verificar se tem permissões para a organização
      // 3. Verificar se completou o onboarding
      
      return {
        hasAccess: true,
        needsOnboarding: false,
        organizationId: organizationId || 'default-org'
      };
      
    } catch (error) {
      console.error('❌ [Access] Erro na validação:', error);
      return {
        hasAccess: false,
        needsOnboarding: true,
        error: error.message
      };
    }
  }
}

// Exemplo de uso no controller
export class OAuthController {
  constructor(private oauthService: OAuthCallbackService) {}

  async handleCallback(req: any, res: any) {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('❌ [OAuth] Erro retornado pelo provedor:', error);
      return res.redirect('/auth/error?error=' + encodeURIComponent(error));
    }

    try {
      const result = await this.oauthService.handleOAuthCallback(code, state);
      
      if (result.success) {
        // Redirecionar para o dashboard
        return res.redirect(result.redirectUrl);
      } else {
        // Redirecionar para página de erro
        return res.redirect(result.redirectUrl);
      }
      
    } catch (error) {
      console.error('❌ [OAuth] Erro no controller:', error);
      return res.redirect('/auth/error?error=' + encodeURIComponent(error.message));
    }
  }
}
