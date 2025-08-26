import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, getLogLevel } from './supabase.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Configurar logging baseado no ambiente
    const logLevel = getLogLevel();
    
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key no backend
      {
        ...supabaseConfig,
        realtime: {
          ...supabaseConfig.realtime,
          log_level: logLevel,
        },
      }
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Método para registrar usuário via email
  async signUp(email: string, password: string, metadata?: any) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.FRONTEND_URL}/email-confirmation` || 'http://localhost:3004/email-confirmation'

      },
    });
  }

  async signIn(email: string, password: string) {
    try {
      console.log('🔐 [Supabase] Tentativa de login para:', email);
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('❌ [Supabase] Erro no login:', error.message);
        
        // Mapear erros específicos do Supabase para mensagens mais claras
        if (error.message?.includes('Invalid login credentials')) {
          error.message = 'Invalid login credentials';
        } else if (error.message?.includes('Email not confirmed')) {
          error.message = 'Email not confirmed';
        } else if (error.message?.includes('User not found')) {
          error.message = 'User not found';
        }
      } else {
        console.log('✅ [Supabase] Login bem-sucedido para:', email);
      }

      return { data, error };
    } catch (error) {
      console.error('❌ [Supabase] Erro inesperado no login:', error);
      return { 
        data: null, 
        error: { 
          message: 'Erro interno no serviço de autenticação',
          status: 500 
        } 
      };
    }
  }

  // Método para obter usuário pelo ID
  async getUser(userId: string) {
    return this.supabase.auth.admin.getUserById(userId);
  }

  // Método para obter usuário a partir do token de acesso
  async getUserFromToken(accessToken: string) {
    try {
      console.log('🔍 [Supabase] Obtendo usuário a partir do token de acesso');
      console.log('🔍 [Supabase] URL:', process.env.SUPABASE_URL);
      console.log('🔍 [Supabase] ANON_KEY configurada:', !!process.env.SUPABASE_ANON_KEY);
      console.log('🔍 [Supabase] Token recebido:', accessToken.substring(0, 20) + '...');
      
      // Criar um cliente Supabase com o token de acesso
      const userClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      );

      const { data, error } = await userClient.auth.getUser();
      
      if (error) {
        console.error('❌ [Supabase] Erro ao obter usuário do token:', error);
        return { data: null, error };
      }

      if (!data?.user) {
        console.error('❌ [Supabase] Usuário não encontrado no token');
        return { data: null, error: { message: 'Usuário não encontrado' } };
      }

      console.log('✅ [Supabase] Usuário obtido do token:', data.user.id);
      return { data: { user: data.user }, error: null };
    } catch (error) {
      console.error('❌ [Supabase] Erro inesperado ao obter usuário do token:', error);
      return { 
        data: null, 
        error: { 
          message: 'Erro interno ao obter usuário do token',
          status: 500 
        } 
      };
    }
  }

  // Método para buscar usuário por email no Supabase Auth
  async getUserByEmail(email: string) {
    try {
      console.log('🔍 [Supabase] Verificando se usuário existe:', email);
      const { data, error } = await this.supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (error) {
        console.error('❌ [Supabase] Erro ao buscar usuários:', error);
        return { data: null, error };
      }

      const user = data.users.find(u => u.email === email);
      console.log('✅ [Supabase] Usuário encontrado:', !!user);
      
      return { data: user || null, error: null };
    } catch (error) {
      console.error('❌ [Supabase] Erro na busca por email:', error);
      return { data: null, error };
    }
  }

  // Método para reenviar email de confirmação
  async resendConfirmationEmail(email: string, password: string) {
    try {
      console.log('📧 [Supabase] Reenviando email de confirmação para:', email);

      // Usar o método "resignup" do Supabase
      // Se o usuário já existe mas não confirmou email, o Supabase reenviará automaticamente
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}/email-confirmation` || 'http://localhost:3004/email-confirmation'
        }
      });

      if (error) {
        // Se o usuário já está registrado, isso é esperado e não é um erro
        if (error.message?.includes('User already registered') || 
            error.message?.includes('already registered') ||
            error.message?.includes('already exists')) {
          console.log('ℹ️ [Supabase] Usuário já registrado, Supabase reenviará email se necessário');
          return {
            data: {
              message: 'Email de confirmação reenviado com sucesso (usuário já existia)',
              email: email,
              userExists: true
            },
            error: null
          };
        }
        
        // Tratar erro de rate limiting (proteção anti-spam do Supabase)
        if (error.message?.includes('For security purposes, you can only request this after') ||
            error.message?.includes('over_email_send_rate_limit') ||
            error.status === 429) {
          console.log('⏳ [Supabase] Rate limiting ativo - email foi enviado recentemente');
          return {
            data: {
              message: 'Email de confirmação foi enviado recentemente. Aguarde alguns segundos antes de tentar novamente.',
              email: email,
              rateLimited: true,
              waitTime: '13 segundos'
            },
            error: null
          };
        }
        
        console.error('❌ [Supabase] Erro ao reenviar email:', error);
        return { data: null, error };
      }

      // Se chegou até aqui, o usuário foi criado ou o email foi reenviado
      console.log('✅ [Supabase] Email de confirmação reenviado para:', email);
      return {
        data: {
          message: 'Email de confirmação reenviado com sucesso',
          email: email,
          userExists: false
        },
        error: null
      };
    } catch (error) {
      console.error('❌ [Supabase] Erro inesperado ao reenviar email:', error);
      return { 
        data: null, 
        error: { 
          message: 'Erro interno ao reenviar email de confirmação',
          status: 500 
        } 
      };
    }
  }

  // Método para gerar URL do Google OAuth
  async signInWithOAuth(provider: string, options: any) {
    try {
      console.log('🔐 [Supabase] Gerando URL do OAuth para:', provider);
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options,
      });

      if (error) {
        console.error('❌ [Supabase] Erro ao gerar URL do OAuth:', error);
        return { data: null, error };
      }

      console.log('✅ [Supabase] URL do OAuth gerada com sucesso');
      return { data, error: null };
    } catch (error) {
      console.error('❌ [Supabase] Erro inesperado no OAuth:', error);
      return { data: null, error };
    }
  }

  // Método para reset de senha
  async resetPassword(email: string) {
    try {
      console.log('🔐 [Supabase] Iniciando reset de senha para:', email);
      
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password` || 'http://localhost:3004/reset-password'
      });

      if (error) {
        console.error('❌ [Supabase] Erro ao resetar senha:', error);
        return { data: null, error };
      }

      console.log('✅ [Supabase] Email de reset de senha enviado com sucesso para:', email);
      return { data, error: null };
    } catch (error) {
      console.error('❌ [Supabase] Erro inesperado ao resetar senha:', error);
      return { 
        data: null, 
        error: { 
          message: 'Erro interno ao resetar senha',
          status: 500 
        } 
      };
    }
  }

  // Método para confirmar reset de senha usando sessão de recuperação
  async resetPasswordConfirm(accessToken: string, refreshToken: string, newPassword: string) {
    try {
      console.log('🔐 [Supabase] Confirmando reset de senha com sessão de recuperação');
      
      // 1. Assumir a sessão de recuperação
      const { data: session, error: sessionErr } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionErr || !session?.session) {
        console.error('❌ [Supabase] Erro ao assumir sessão de recuperação:', sessionErr);
        return { 
          data: null, 
          error: { 
            message: 'Token inválido ou expirado',
            status: 400 
          } 
        };
      }

      console.log('✅ [Supabase] Sessão de recuperação assumida para usuário:', session.session.user.id);

      // 2. Atualizar senha
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ [Supabase] Erro ao atualizar senha:', error);
        return { data: null, error };
      }

      console.log('✅ [Supabase] Senha atualizada com sucesso');
      return { data, error: null };
    } catch (error) {
      console.error('❌ [Supabase] Erro inesperado ao confirmar reset de senha:', error);
      return { 
        data: null, 
        error: { 
          message: 'Erro interno ao confirmar reset de senha',
          status: 500 
        } 
      };
    }
  }

  // Método melhorado para lidar com timeouts
  async signUpWithRetry(email: string, password: string, metadata?: any, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [Supabase] Tentativa ${attempt}/${maxRetries} de criar usuário:`, email);
        
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: `${process.env.FRONTEND_URL}/email-confirmation` || 'http://localhost:3004/email-confirmation'
          }
        
        });

        if (error) {
          // Se o usuário já existe, não é necessário retry
          if (error.message?.includes('already') || error.message?.includes('registered')) {
            console.log('ℹ️ [Supabase] Usuário já existe, buscando dados:', email);
            const existingUser = await this.getUserByEmail(email);
            return { data: existingUser.data ? { user: existingUser.data } : null, error: existingUser.error };
          }
          
          console.error(`❌ [Supabase] Erro na tentativa ${attempt}:`, error);
          if (attempt === maxRetries) return { data, error };
          
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        console.log('✅ [Supabase] Usuário criado com sucesso:', data?.user?.id);
        return { data, error };
        
      } catch (networkError: any) {
        console.error(`❌ [Supabase] Erro de rede na tentativa ${attempt}:`, networkError?.message);
        
        // Se é erro de timeout e ainda há tentativas, continuar
        if (networkError?.code === 'UND_ERR_CONNECT_TIMEOUT' && attempt < maxRetries) {
          console.log(`⏳ [Supabase] Aguardando antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        
        // Se é a última tentativa ou erro crítico, tentar buscar o usuário
        if (attempt === maxRetries) {
          console.log('🔍 [Supabase] Última tentativa falhou, verificando se usuário foi criado...');
          const existingUser = await this.getUserByEmail(email);
          if (existingUser.data) {
            console.log('✅ [Supabase] Usuário encontrado após erro de rede!');
            return existingUser;
          }
        }
        
        if (attempt === maxRetries) {
          return { data: null, error: networkError };
        }
      }
    }

    return { data: null, error: new Error('Falha após todas as tentativas') };
  }
}
