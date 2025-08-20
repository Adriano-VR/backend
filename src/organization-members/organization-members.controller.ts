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
import { OrganizationMember } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { OrganizationMembersService } from './organization-members.service';

@ApiTags('Organization Members')
@Controller('organization-members')
export class OrganizationMembersController {
  constructor(
    private readonly organizationMembersService: OrganizationMembersService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Adicionar membro à organização',
    description: 'Adiciona um novo membro a uma organização',
  })
  @ApiResponse({
    status: 201,
    description: 'Membro adicionado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Usuário já é membro desta organização',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrganizationMemberDto: CreateOrganizationMemberDto,
  ): Promise<OrganizationMember> {
    return this.organizationMembersService.create(createOrganizationMemberDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar membros de organizações',
    description:
      'Lista todos os membros ou aplica filtros se query parameters forem fornecidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de membros retornada com sucesso',
  })
  @Get()
  async findAll(
    @Query() query?: any,
  ): Promise<FindWithQueryResult<OrganizationMember>> {
    // Se houver query parameters, usar busca com filtros
    if (query && Object.keys(query).length > 0) {
      return this.organizationMembersService.findWithQuery(query);
    }
    // Caso contrário, retornar todos
    return this.organizationMembersService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar membro por ID',
    description: 'Retorna um membro específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do membro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrganizationMember> {
    return this.organizationMembersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar membros por organização',
    description: 'Retorna todos os membros de uma organização específica',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Membros da organização encontrados',
  })
  @Get('organization/:organizationId')
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationMember[]> {
    return this.organizationMembersService.findByOrganizationId(organizationId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar membro da organização',
    description: 'Atualiza role ou status de um membro da organização',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do membro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationMemberDto: UpdateOrganizationMemberDto,
  ): Promise<OrganizationMember> {
    return this.organizationMembersService.update(
      id,
      updateOrganizationMemberDto,
    );
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Remover membro da organização',
    description: 'Remove um membro de uma organização (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do membro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado',
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<OrganizationMember> {
    return this.organizationMembersService.remove(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Remover membro específico da organização',
    description:
      'Remove um usuário específico de uma organização usando profileId e organizationId',
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID do perfil do usuário',
    type: 'string',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não é membro desta organização',
  })
  @Delete('profile/:profileId/organization/:organizationId')
  async removeMemberFromOrganization(
    @Param('profileId') profileId: string,
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationMember> {
    return this.organizationMembersService.removeMemberFromOrganization(
      profileId,
      organizationId,
    );
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar role do membro',
    description: 'Atualiza a função de um membro específico na organização',
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID do perfil do usuário',
    type: 'string',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    type: 'string',
  })
  @ApiParam({
    name: 'newRole',
    description: 'Nova função do membro',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Role atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não é membro desta organização',
  })
  @Patch('profile/:profileId/organization/:organizationId/role/:newRole')
  async updateMemberRole(
    @Param('profileId') profileId: string,
    @Param('organizationId') organizationId: string,
    @Param('newRole') newRole: string,
  ): Promise<OrganizationMember> {
    return this.organizationMembersService.updateMemberRole(
      profileId,
      organizationId,
      newRole,
    );
  }
}
