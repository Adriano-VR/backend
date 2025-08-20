import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { Profile } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import {
  CreateCollaboratorDto,
  CreateProfessionalDto,
  CreateProfileDto,
  RegisterResponseDto,
  Role,
  UpdateProfileDto,
} from './dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // ==================== ENDPOINTS CRUD PADRÃO ====================

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar um novo perfil',
    description: 'Cria um novo perfil de usuário no sistema',
  })
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Perfil criado com sucesso',
    type: 'object',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou email/CPF já em uso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async create(@Body() createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.profilesService.create(createProfileDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar todos os perfis',
    description: 'Busca todos os perfis ativos do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfis retornada com sucesso',
    type: 'array',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Profile>> {
    if (query && Object.keys(query).length > 0) {
      return this.profilesService.findWithQuery(query);
    }

    return this.profilesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar perfil por ID',
    description: 'Busca um perfil específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do perfil',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil encontrado com sucesso',
    type: 'object',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async findOne(@Param('id') id: string): Promise<Profile> {
    return this.profilesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar perfil',
    description: 'Atualiza os dados de um perfil existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do perfil',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    type: 'object',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    console.log(id, 'id');
    console.log(updateProfileDto, 'updateProfileDto');
    return this.profilesService.update(id, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar perfil',
    description: 'Remove um perfil do sistema (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do perfil',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil deletado com sucesso',
    type: 'object',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async remove(@Param('id') id: string): Promise<Profile> {
    return this.profilesService.remove(id);
  }

  // ==================== ENDPOINTS ESPECÍFICOS ====================

  @UseGuards(AuthGuard)
  @Get('email/:email')
  @ApiOperation({
    summary: 'Buscar perfil por email',
    description: 'Busca um perfil específico pelo seu email',
  })
  @ApiParam({
    name: 'email',
    description: 'Email do usuário',
    example: 'joao.silva@empresa.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil encontrado com sucesso',
    type: 'object',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  async findByEmail(@Param('email') email: string): Promise<Profile> {
    return this.profilesService.findByEmail(email);
  }

  @UseGuards(AuthGuard)
  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Buscar perfil por slug',
    description: 'Busca um perfil específico pelo seu slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do perfil',
    example: 'joao-silva-12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil encontrado com sucesso',
    type: 'object',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Profile> {
    return this.profilesService.findBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @Get('department/:departmentId')
  @ApiOperation({
    summary: 'Buscar perfis por departamento',
    description: 'Busca todos os perfis de um departamento específico',
  })
  @ApiParam({
    name: 'departmentId',
    description: 'ID do departamento',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfis do departamento',
    type: 'array',
  })
  async findByDepartmentId(
    @Param('departmentId') departmentId: string,
  ): Promise<Profile[]> {
    return this.profilesService.findByDepartmentId(departmentId);
  }

  @UseGuards(AuthGuard)
  @Get('role/:role')
  @ApiOperation({
    summary: 'Buscar perfis por role',
    description: 'Busca todos os perfis com um role específico',
  })
  @ApiParam({
    name: 'role',
    description: 'Role do usuário',
    enum: Role,
    example: Role.collaborator,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfis com o role especificado',
    type: 'array',
  })
  async findByRole(@Param('role') role: string): Promise<Profile[]> {
    return this.profilesService.findByRole(role);
  }

  @UseGuards(AuthGuard)
  @Get('active/all')
  @ApiOperation({
    summary: 'Buscar perfis ativos',
    description: 'Busca todos os perfis ativos com email confirmado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfis ativos',
    type: 'array',
  })
  async findActiveProfiles(): Promise<Profile[]> {
    return this.profilesService.findActiveProfiles();
  }

  @UseGuards(AuthGuard)
  @Get('me/organization')
  @ApiOperation({
    summary: 'Buscar perfis da minha organização',
    description:
      'Lista todos os colaboradores da empresa do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de colaboradores da organização',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  async getAllFromMyOrganization(@Request() req: any) {
    const users = await this.profilesService.findAllByMyOrganization(
      req.user.sub,
    );
    return { users };
  }

  // ==================== ENDPOINTS LEGACY DE REGISTRO ====================

  @Post('register-collaborator')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastro de colaborador',
    description: 'Registra um novo colaborador em uma empresa existente',
  })
  @ApiBody({ type: CreateCollaboratorDto })
  @ApiResponse({
    status: 201,
    description: 'Colaborador criado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Código de registro inválido ou dados inválidos',
  })
  async createCollaborator(
    @Body() dto: CreateCollaboratorDto,
  ): Promise<RegisterResponseDto> {
    const { user, organization } =
      await this.profilesService.createCollaborator(dto);

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
      cpf: user.cpf,
    };

    const formattedOrganization = {
      id: organization.id,
      name: organization.name,
      whatsapp: organization.whatsapp || '',
      nr1_status: organization.nr1Status,
      is_active: organization.isActive,
      has_completed_onboarding: organization.hasCompletedOnboarding,
      head_office_uuid: organization.headOfficeUuid || '',
      created_at: organization.createdAt,
    };

    return { user: formattedUser, organization: formattedOrganization };
  }

  @Post('register-professional')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastro de profissional',
    description: 'Registra um novo profissional em uma empresa existente',
  })
  @ApiBody({ type: CreateProfessionalDto })
  @ApiResponse({
    status: 201,
    description: 'Profissional criado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'CNPJ não encontrado ou dados inválidos',
  })
  async createProfessional(
    @Body() dto: CreateProfessionalDto,
  ): Promise<RegisterResponseDto> {
    const { user, organization } =
      await this.profilesService.createProfessional(dto);

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
      cpf: user.cpf,
    };

    const formattedOrganization = {
      id: organization.id,
      name: organization.name,
      whatsapp: organization.whatsapp || '',
      nr1_status: organization.nr1Status,
      is_active: organization.isActive,
      has_completed_onboarding: organization.hasCompletedOnboarding,
      head_office_uuid: organization.headOfficeUuid || '',
      created_at: organization.createdAt,
    };

    return { user: formattedUser, organization: formattedOrganization };
  }

  @UseGuards(AuthGuard)
  @Delete('organization/:organizationId/profile/:name')
  @ApiOperation({
    summary: 'Remover perfil por nome',
    description:
      'Remove um perfil pelo nome em uma organização específica (soft delete)',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome do perfil',
    example: 'João Silva',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  async removeByName(
    @Param('organizationId') organizationId: string,
    @Param('name') name: string,
  ): Promise<Profile> {
    return this.profilesService.removeByName(
      decodeURIComponent(name),
      organizationId,
    );
  }
}
