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
import { Group } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Criar um novo grupo',
    description: 'Cria um novo grupo no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Grupo criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return this.groupsService.create(createGroupDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar grupos',
    description:
      'Lista todos os grupos ou aplica filtros se query parameters forem fornecidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos retornada com sucesso',
  })
  @Get()
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Group>> {
    // Se houver query parameters, usar busca com filtros
    if (query && Object.keys(query).length > 0) {
      return this.groupsService.findWithQuery(query);
    }
    // Caso contrário, retornar todos
    return this.groupsService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar grupo por ID',
    description: 'Retorna um grupo específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar grupo por slug',
    description: 'Retorna um grupo específico pelo seu slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do grupo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Group> {
    return this.groupsService.findBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar um grupo',
    description: 'Atualiza os dados de um grupo existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.update(id, updateGroupDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletar um grupo',
    description: 'Remove um grupo do sistema (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do grupo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Group> {
    return this.groupsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Delete('organization/:userId/group/:name')
  @ApiOperation({
    summary: 'Remover grupo por nome',
    description:
      'Remove um grupo pelo nome em uma organização específica (soft delete)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome do grupo',
    example: 'Desenvolvimento',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo não encontrado',
  })
  async removeByName(
    @Param('userId') userId: string,
    @Param('name') name: string,
  ): Promise<Group> {
    console.log('🔥 removeByName chamado');
    console.log('🔥 userId:', userId);
    console.log('🔥 name:', name);
    return this.groupsService.removeByName(decodeURIComponent(name), userId);
  }
}
