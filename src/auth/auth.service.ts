import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { OrganizationMemberRepository } from 'src/repositories/organization-member-repository';
import { ProfileRepository } from 'src/repositories/profile-repositorie';
import { UtilsService } from 'src/shared/utils';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { LoginDto } from './dto/login.dto';
import { Nr1Status } from './dto/nr1-status.enum';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { RegisterDto } from './dto/register.dto';
import { HttpException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private profileRepository: ProfileRepository,
    private organizationMemberRepository: OrganizationMemberRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService, // Temporário para outros métodos
    private readonly supabaseService: SupabaseService,
    private utilsService: UtilsService,
    private readonly emailService: EmailService,
  ) {}

  /** Só cria o usuário */
  async register(dto: RegisterDto) {
    console.log('📝 [Auth] Iniciando registro via Supabase:', dto.email);

    try {
      // 1. Verificar se usuário já existe no Supabase primeiro
      console.log('🔍 [Auth] Verificando se usuário já existe no Supabase...');
      const existingSupabaseUser = await this.supabaseService.getUserByEmail(dto.email);
      
      let supabaseUser;
      
      if (existingSupabaseUser.data) {
        console.log('ℹ️ [Auth] Usuário já existe no Supabase, verificando banco local...');
        supabaseUser = existingSupabaseUser.data;
        
        // Verificar se o usuário já está no banco local
        const localUser = await this.profileRepository.findById(supabaseUser.id);
        if (localUser) {
          console.log('⚠️ [Auth] Usuário já cadastrado no sistema (Supabase + Local):', dto.email);
          throw new BadRequestException('Este email já está cadastrado. Faça login para acessar sua conta.');
        }
        
        // Se existe no Supabase mas não no local, vamos criar no local
        console.log('🔄 [Auth] Usuário existe no Supabase mas não no local, sincronizando...');
      } else {
        // 2. Criar usuário no Supabase Auth (com retry para timeouts)
        console.log('🔐 [Auth] Criando novo usuário no Supabase...');
        const { data: supabaseData, error: supabaseError } =
          await this.supabaseService.signUpWithRetry(dto.email, dto.password);

        if (supabaseError) {
          console.error('❌ [Auth] Erro no Supabase após retry:', supabaseError);
          
          // Se é erro de rede, tentar buscar o usuário novamente
          if (supabaseError.code === 'UND_ERR_CONNECT_TIMEOUT' || 
              supabaseError.message?.includes('fetch failed')) {
            console.log('🔍 [Auth] Verificando se usuário foi criado apesar do erro...');
            const retryCheck = await this.supabaseService.getUserByEmail(dto.email);
            if (retryCheck.data) {
              console.log('✅ [Auth] Usuário encontrado após erro de rede!');
              supabaseUser = retryCheck.data;
            } else {
              throw new BadRequestException('Erro de conectividade. Tente novamente em alguns segundos.');
            }
          } else {
            throw new BadRequestException(
              `Erro ao criar conta: ${supabaseError.message}`,
            );
          }
        } else if (!supabaseData || ('user' in supabaseData && !supabaseData.user)) {
          throw new BadRequestException('Falha ao criar usuário no Supabase');
        } else {
          // Se supabaseData é um User diretamente, usar ele, senão usar supabaseData.user
          supabaseUser = 'user' in supabaseData ? supabaseData.user : supabaseData;
        }
      }

      if (!supabaseUser) {
        throw new BadRequestException('Erro ao processar dados do usuário');
      }

      console.log('✅ [Auth] Processando usuário do Supabase:', supabaseUser.id);

      // 3. Preparar dados do usuário para o banco local
      let slug = this.utilsService.makeSlug(dto.name);

      const existingBySlug = await this.profileRepository.findBySlug(slug);
      if (existingBySlug) {
        slug = this.utilsService.makeSlug(dto.name);
      }

      const profileData: Prisma.profileCreateInput = {
        id: supabaseUser.id, // Usar o ID do Supabase
        slug,
        name: dto.name,
        email: dto.email,
        emailConfirmed: supabaseUser.email_confirmed_at ? true : false,
        ...(dto.custom?.role ? { role: dto.custom.role } : {}),
        ...(dto.custom?.departmentId ? { departmentId: dto.custom.departmentId } : {}),
      };

      // 4. Criar usuário no banco local
      console.log('💾 [Auth] Criando usuário no banco local...');
      const user = await this.profileRepository.create(profileData);

      if (dto.custom?.organizationId && dto.custom?.role) {
        console.log('🏢 [Auth] Adicionando usuário à organização...');
        await this.organizationMemberRepository.create({
          profile: {
            connect: {
              id: user.id,
            },
          },
          organization: {
            connect: {
              id: dto.custom.organizationId,
            },
          },
          role: dto.custom.role,
        });
      }

      // 5. Gerar token JWT
      const token = this.jwtService.sign({
        sub: user.id,
        role: user.role,
        completedOnboarding: user.completedOnboarding,
      });
      console.log('✅ [Auth] Usuário criado localmente com sucesso:', user.email);

      // Ajustar mensagem baseada no status da confirmação
      let message: string;
      if (supabaseUser.email_confirmed_at) {
        message = 'Usuário criado com sucesso!';
      } else {
        message = 'Usuário criado! Verifique seu email para confirmar a conta.';
      }

      return {
        access_token: token,
        user,
        message,
      };
    } catch (error: any) {
      console.error('❌ [Auth] Erro no registro:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Tratamentos específicos para diferentes tipos de erro
      if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
        throw new BadRequestException('Este email já está cadastrado. Faça login para acessar sua conta.');
      }
      
      if (error?.code === 'P2002' && error?.meta?.target?.includes('id')) {
        throw new BadRequestException('Este usuário já está cadastrado. Faça login para acessar sua conta.');
      }
      
      if (error?.message?.includes('timeout') || error?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        throw new BadRequestException('Erro de conectividade. Tente novamente em alguns segundos.');
      }
      
      console.error('❌ [Auth] Erro não tratado no registro:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack?.slice(0, 500)
      });
      
      throw new BadRequestException('Erro interno no registro. Tente novamente.');
    }
  }

  /** Login normal */
  async login(dto: LoginDto) {
    console.log('🔐 [Auth] Tentativa de login:', dto.email);

    try {
      const { data, error } = await this.supabaseService.signIn(
        dto.email,
        dto.password,
      );

      console.log(data, 'data-login');
      console.log(error?.message, 'error-login');

      // Se há erro do Supabase, verificar se é credenciais inválidas
      if (error) {
        console.log('❌ [Auth] Erro do Supabase:', error.message);
        
        // Verificar se é erro de email não confirmado
        if (error.message?.includes('Email not confirmed') || 
            error.message?.includes('email not confirmed')) {
          throw new BadRequestException('EMAIL_NAO_CONFIRMADO');
        }
        
        // Verificar se é erro de credenciais inválidas
        if (error.message?.includes('Invalid login credentials') || 
            error.message?.includes('Invalid email or password') ||
            error.message?.includes('Invalid credentials') ||
            error.message?.includes('User not found')) {
          throw new UnauthorizedException('Credenciais inválidas');
        }
        
        // Se for outro tipo de erro, logar e retornar erro genérico
        console.error('❌ [Auth] Erro inesperado do Supabase:', error);
        throw new UnauthorizedException('Erro ao processar login. Tente novamente.');
      }

      // Verificar se o usuário existe e email está confirmado
      if (!data?.user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Não precisamos mais verificar email_confirmed_at aqui, pois o Supabase já faz isso
      // Se chegou até aqui, significa que o email está confirmado

      const user = await this.profileRepository.findById(data.user.id);
      console.log(data.session, 'session');

      console.log('👤 [Auth] Usuário encontrado:', user?.id, user?.email);
      if (!user) throw new UnauthorizedException('Credenciais inválidas');

      const token = this.jwtService.sign({
        sub: user.id,
        role: user.role,
        completedOnboarding: user.completedOnboarding,
      });
      console.log('✅ [Auth] Login bem-sucedido:', user.email);

      return { access_token: token, user };
    } catch (error) {
      // Se já é uma exceção HTTP específica, re-throw
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Log do erro inesperado
      console.error('❌ [Auth] Erro inesperado no login:', error);
      
      // Para qualquer outro erro, retornar credenciais inválidas
      // (mais seguro do que expor detalhes internos)
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  /** Reenviar email de confirmação */
  async resendConfirmationEmail(email: string, password: string) {
    console.log('📧 [Auth] Reenviando email de confirmação para:', email);

    try {
      const { data, error } = await this.supabaseService.resendConfirmationEmail(email, password);
      
      console.log('📧 [Auth] Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ [Auth] Erro ao reenviar email:', error);
        throw new BadRequestException('Erro ao reenviar email de confirmação');
      }

      console.log('✅ [Auth] Email de confirmação reenviado para:', email);
      return { message: 'Email de confirmação reenviado com sucesso' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error('❌ [Auth] Erro inesperado ao reenviar email:', error);
      throw new BadRequestException('Erro ao reenviar email de confirmação');
    }
  }

  async refleshToken(token: string) {
    console.log('🔄 [Auth] Iniciando refresh token');

    try {
      // 1. Decodificar o token atual para pegar o ID do usuário
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      console.log('👤 [Auth] Token decodificado para usuário:', userId);

      // 2. Buscar o usuário no banco para garantir que ainda existe e está ativo

      const user = await this.profileRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // 3. Gerar um novo token
      const newToken = this.jwtService.sign({
        sub: user.id,
        role: user.role,
        completedOnboarding: user.completedOnboarding,
      });

      console.log('✅ [Auth] Novo token gerado para:', user.email);

      return {
        access_token: newToken,
        user,
      };
    } catch (error) {
      console.error('❌ [Auth] Erro no refresh token:', error);

      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      throw new UnauthorizedException('Erro ao renovar token');
    }
  }

  /** Gera URL do Google OAuth */
  async signInWithGoogle() {
    console.log('🔐 [Auth] Gerando URL do Google OAuth...');
    
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'https://www.mentesegura.institute';
      const redirectUrl = `${frontendUrl}/auth/callback`;
      
      console.log('🔗 URL de redirecionamento:', redirectUrl);
      
      const { data, error } = await this.supabaseService.signInWithOAuth('google', {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      if (error) {
        console.error('❌ [Auth] Erro ao gerar URL do Google OAuth:', error);
        throw new BadRequestException(error.message);
      }

      if (!data?.url) {
        console.error('❌ [Auth] URL de redirecionamento não gerada');
        throw new BadRequestException('URL de redirecionamento não gerada');
      }

      console.log('✅ [Auth] URL do Google OAuth gerada com sucesso');
      return { url: data.url };
    } catch (error) {
      console.error('❌ [Auth] Erro inesperado no Google OAuth:', error);
      throw new BadRequestException('Erro ao gerar URL do Google OAuth');
    }
  }

  /** OAuth via Supabase */
  async handleOAuthCallback(dto: OAuthCallbackDto) {
    console.log('🔐 [Auth] Iniciando OAuth callback para usuário:', dto.user.id);
    console.log('📧 [Auth] Email do usuário:', dto.user.email);

    // 1. Primeiro, tentar encontrar o profile pelo ID do usuário
    let user = await this.profileRepository.findById(dto.user.id);
    console.log('👤 [Auth] Profile encontrado por ID:', !!user);

    if (!user) {
      // 2. Se não encontrou por ID, buscar por email
      const existingProfileByEmail = await this.profileRepository.findByEmail(dto.user.email!);
      console.log('🔍 [Auth] Profile encontrado por email:', !!existingProfileByEmail);

      if (existingProfileByEmail) {
        // 3. Se existe profile com o mesmo email mas ID diferente, criar um novo
        console.log('⚠️ [Auth] Profile com email existente mas ID diferente. Criando novo profile...');
        
        // Gerar slug único para o novo profile
        let slug = this.utilsService.makeSlug(
          dto.user.user_metadata.name || dto.user.email!,
        );

        const existingBySlug = await this.profileRepository.findBySlug(slug);
        if (existingBySlug) {
          slug = `${slug}-${Date.now()}`;
        }

        // Criar novo profile com o ID do usuário atual
        user = await this.profileRepository.create({
          ...(dto.user.custom?.role ? { role: dto.user.custom.role } : {}),
          slug,
          id: dto.user.id,
          name: dto.user.user_metadata.name || dto.user.email!,
          email: dto.user.email!,
          emailConfirmed: true,
        });

        console.log('✅ [Auth] Novo profile criado para usuário com email existente');
      }
    }

    // 4. Se ainda não tem user, criar um novo profile
    if (!user) {
      console.log('📝 [Auth] Criando novo profile via OAuth...');
      let slug = this.utilsService.makeSlug(
        dto.user.user_metadata.name || dto.user.email!,
      );

      const existingBySlug = await this.profileRepository.findBySlug(slug);
      if (existingBySlug) {
        slug = `${slug}-${Date.now()}`;
      }

      user = await this.profileRepository.create({
        ...(dto.user.custom?.role ? { role: dto.user.custom.role } : {}),
        slug,
        id: dto.user.id,
        name: dto.user.user_metadata.name || dto.user.email!,
        email: dto.user.email!,
        emailConfirmed: true,
      });

      console.log('✅ [Auth] Novo profile criado com sucesso');

      // 5. Se tem organização customizada, criar membro da organização
      if (dto.user.custom?.organizationId && dto.user.custom?.role) {
        try {
          await this.organizationMemberRepository.create({
            profile: {
              connect: {
                id: user.id,
              },
            },
            organization: {
              connect: {
                id: dto.user.custom.organizationId,
              },
            },
            role: dto.user.custom.role,
          });
          console.log('🏢 [Auth] Membro da organização criado');
        } catch (error) {
          console.error('❌ [Auth] Erro ao criar membro da organização:', error);
        }
      }
    }

    // 6. Buscar o user final para garantir que temos todos os dados
    user = await this.profileRepository.findById(dto.user.id);

    if (user) {
      const token = this.jwtService.sign({
        sub: user.id,
        role: user.role,
        completedOnboarding: user.completedOnboarding,
      });

      console.log('🎉 [Auth] OAuth callback concluído com sucesso para:', user.email);
      return { access_token: token, user };
    } else {
      console.error('❌ [Auth] Erro: Não foi possível criar ou encontrar o profile');
      throw new BadRequestException('Erro ao processar autenticação OAuth');
    }
  }

  /** Pega dados básicos do perfil */
  async getProfile(token: string) {
    const decoded = this.jwtService.verify(token);
    const userId = decoded.sub;
    const user = await this.profileRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return user;
  }

  /** Atualiza somente o perfil do usuário */
  async completeProfile(userId: string, dto: CompleteProfileDto) {
    console.log('🛠 [Auth] CompleteProfile, só atualiza user…');
    const data: any = {
      name: dto.name,
      whatsapp: dto.whatsapp,
      jobTitle: dto.jobTitle,
      nr1Status: dto.nr1Status as Nr1Status,
      cpf: dto.cpf,
      role: dto.role,
    };

    const updated = await this.profileRepository.update(userId, data);

    return { user: updated };
  }

  /** Verifica usuário autenticado via Supabase e retorna dados completos */
  async verifySupabaseUser(supabaseUserId: string, email: string) {
    console.log('🔍 [Auth] Verificando usuário Supabase:', { supabaseUserId, email });

    try {
      let user: any = null;
      
      // 1. PRIMEIRO: Verificar se usuário já existe por email (mais confiável)
      console.log('🔍 [Auth] Buscando usuário por email...');
      user = await this.profileRepository.findByEmail(email);
      
      if (user) {
        console.log('✅ [Auth] Usuário encontrado por email:', { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          completedOnboarding: user.completedOnboarding 
        });
        
        // Se o ID do Supabase for diferente, atualizar
        if (user.id !== supabaseUserId) {
          console.log('🔄 [Auth] Atualizando ID do usuário para Supabase ID');
          user = await this.profileRepository.update(user.id, {
            id: supabaseUserId,
          });
        }
      } else {
        // 2. SEGUNDO: Verificar se existe pelo ID do Supabase
        console.log('🔍 [Auth] Usuário não encontrado por email, buscando por ID...');
        user = await this.profileRepository.findById(supabaseUserId);
        
        if (user) {
          console.log('✅ [Auth] Usuário encontrado por ID Supabase:', { 
            id: user.id, 
            email: user.email, 
            role: user.role 
          });
        } else {
          // 3. TERCEIRO: Criar novo usuário apenas se realmente não existir
          console.log('📝 [Auth] Usuário não encontrado, criando novo...');
          const slug = this.utilsService.makeSlug(email.split('@')[0]);
          
          user = await this.profileRepository.create({
            id: supabaseUserId,
            slug,
            name: email.split('@')[0], // Nome temporário baseado no email
            email: email,
            emailConfirmed: true,
            role: 'preset', // Role padrão para usuários novos
            completedOnboarding: false,
          });
          
          console.log('✅ [Auth] Novo usuário criado:', { 
            id: user.id, 
            email: user.email, 
            role: user.role 
          });
        }
      }

      if (!user) {
        throw new UnauthorizedException('Erro ao criar/recuperar usuário');
      }

      // 4. Gerar token JWT
      const token = this.jwtService.sign({
        sub: user.id,
        role: user.role,
        completedOnboarding: user.completedOnboarding,
      });

      console.log('🎉 [Auth] Usuário Supabase verificado com sucesso:', { 
        userId: user.id, 
        role: user.role,
        completedOnboarding: user.completedOnboarding,
        isNewUser: user.completedOnboarding === false
      });

      return { 
        access_token: token, 
        user: {
          ...user,
          onboardingCompleted: user.completedOnboarding // Mapear para o formato esperado pelo frontend
        }
      };

    } catch (error) {
      console.error('❌ [Auth] Erro ao verificar usuário Supabase:', error);
      throw error;
    }
  }
}
