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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { Organization } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { AssociateProfileToOrgDto } from './dto/associate-profile-to-org';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Criar uma nova organização',
    description: 'Cria uma nova organização no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Organização criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug, código de registro ou usuário já existe',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const data = {
      ...createOrganizationDto,

      ...(createOrganizationDto.name
        ? { name: createOrganizationDto.name }
        : { name: createOrganizationDto.name }),
    };
    return this.organizationsService.create(data);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar organizações com filtros',
    description:
      'Retorna organizações com base em filtros complexos via query parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de organizações filtradas retornada com sucesso',
  })
  @Get()
  async findAll(
    @Query() query?: any,
  ): Promise<FindWithQueryResult<Organization>> {
    // Se houver query parameters, usar busca com filtros
    if (query && Object.keys(query).length > 0) {
      return this.organizationsService.findWithQuery(query);
    }
    // Caso contrário, retornar todas
    return this.organizationsService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar organizações ativas',
    description: 'Retorna apenas as organizações ativas (não deletadas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de organizações ativas retornada com sucesso',
  })
  @Get('active')
  async findActiveOrganizations(): Promise<Organization[]> {
    return this.organizationsService.findActiveOrganizations();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar organização por ID',
    description: 'Retorna uma organização específica pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organization> {
    return this.organizationsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar organização por slug',
    description: 'Retorna uma organização específica pelo seu slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Organization> {
    return this.organizationsService.findBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar organização por usuário',
    description: 'Retorna a organização associada a um usuário específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário (Supabase)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma organização encontrada para o usuário',
  })
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Organization[]> {
    return this.organizationsService.findByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar organização por código de registro',
    description: 'Retorna uma organização específica pelo código de registro',
  })
  @ApiParam({
    name: 'code',
    description: 'Código de registro da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Get('registration-code/:code')
  async findByRegistrationCode(
    @Param('code') code: string,
  ): Promise<Organization> {
    return this.organizationsService.findByRegistrationCode(code);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar organizações por criador',
    description:
      'Retorna todas as organizações criadas por um usuário específico',
  })
  @ApiParam({
    name: 'createdById',
    description: 'ID do criador',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizações encontradas com sucesso',
  })
  @Get('created-by/:createdById')
  async findByCreatedById(
    @Param('createdById') createdById: string,
  ): Promise<Organization[]> {
    return this.organizationsService.findByCreatedById(createdById);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar organização por ID',
    description: 'Atualiza os dados de uma organização específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug, código de registro ou usuário já existe',
  })
  @Patch('associate-profile-to-org')
  async associateProfileToOrg(
    @Body() associateProfileToOrgDto: AssociateProfileToOrgDto,
  ): Promise<Organization> {
    console.log(associateProfileToOrgDto);

    return this.organizationsService.associateProfileToOrg(
      associateProfileToOrgDto,
    );
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar organização por ID',
    description: 'Atualiza os dados de uma organização específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug, código de registro ou usuário já existe',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar configurações da organização',
    description: 'Atualiza as configurações específicas da organização, incluindo frequência de formulários',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações atualizadas com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Patch(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateOrganizationSettingsDto,
  ): Promise<Organization> {
    return this.organizationsService.updateSettings(id, updateSettingsDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar configurações da organização',
    description: 'Retorna as configurações específicas da organização, incluindo frequência de formulários',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações encontradas com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Get(':id/settings')
  async getSettings(@Param('id') id: string): Promise<any> {
    return this.organizationsService.getSettings(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletar organização por ID',
    description: 'Remove uma organização específica do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Organização deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.organizationsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Delete('organization/:name')
  @ApiOperation({
    summary: 'Remover organização por nome',
    description: 'Remove uma organização pelo nome (soft delete)',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome da organização',
    example: 'Empresa XYZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  async removeByName(
    @Param('name') name: string,
    @Query('userId') userId?: string,
  ): Promise<Organization> {
    return this.organizationsService.removeByName(
      decodeURIComponent(name),
      userId,
    );
  }

  @ApiOperation({
    summary: 'Buscar organização por slug (público)',
    description:
      'Retorna uma organização específica pelo seu slug - endpoint público sem autenticação',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @Get('public/slug/:slug')
  async findBySlugPublic(@Param('slug') slug: string): Promise<Organization> {
    console.log('Procurando por slug público: ', slug);
    return this.organizationsService.findBySlug(slug);
  }

  @ApiOperation({
    summary: 'Listar organizações com filtros (público)',
    description:
      'Retorna organizações com base em filtros complexos via query parameters - endpoint público sem autenticação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de organizações filtradas retornada com sucesso',
  })
  @Get('public')
  async findAllPublic(
    @Query() query?: any,
  ): Promise<FindWithQueryResult<Organization>> {
    // Se houver query parameters, usar busca com filtros
    if (query && Object.keys(query).length > 0) {
      return this.organizationsService.findWithQuery(query);
    }
    // Caso contrário, retornar todas
    return this.organizationsService.findAll();
  }

  @ApiOperation({
    summary: 'Debug organizações (público)',
    description: 'Endpoint de debug para verificar organizações - endpoint público sem autenticação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de organizações para debug retornada com sucesso',
  })
  @Get('public/debug')
  async debugOrganizations(): Promise<any[]> {
    const organizations = await this.organizationsService.findAll();
    return organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      cnpj: org.cnpj,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
  }
}
