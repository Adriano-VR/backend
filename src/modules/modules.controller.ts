import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { Module } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateModuleDto, UpdateModuleDto } from './dto';
import { ModulesService } from './modules.service';

@ApiTags('Módulos')
@Controller('modules')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo módulo',
    description: 'Cria um novo módulo no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Módulo criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async create(@Body() createModuleDto: CreateModuleDto): Promise<Module> {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os módulos',
    description: 'Retorna uma lista de todos os módulos ativos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de módulos retornada com sucesso',
  })
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Module>> {
    if (query && Object.keys(query).length > 0) {
      return this.modulesService.findWithQuery(query);
    }

    return this.modulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar módulo por ID',
    description: 'Retorna um módulo específico pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do módulo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo não encontrado',
  })
  async findById(@Param('id') id: string): Promise<Module> {
    return this.modulesService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Buscar módulo por slug',
    description: 'Retorna um módulo específico pelo slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do módulo',
    example: 'introducao-ao-react-123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo não encontrado',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Module> {
    return this.modulesService.findBySlug(slug);
  }

  @Get('course/:courseId')
  @ApiOperation({
    summary: 'Buscar módulos por curso',
    description: 'Retorna todos os módulos de um curso específico',
  })
  @ApiParam({
    name: 'courseId',
    description: 'ID do curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulos do curso encontrados',
  })
  async findByCourseId(@Param('courseId') courseId: string): Promise<Module[]> {
    return this.modulesService.findByCourseId(courseId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar módulo',
    description: 'Atualiza um módulo existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do módulo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<Module> {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover módulo',
    description: 'Remove um módulo (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do módulo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulo removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Módulo não encontrado',
  })
  async remove(@Param('id') id: string): Promise<Module> {
    return this.modulesService.remove(id);
  }
}
