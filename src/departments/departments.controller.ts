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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// decodeURIComponent is a native JavaScript function, no need to import from lodash
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { Department } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { AssociateProfileToDepartmentDto } from './dto/associate-profile-to-department';

@ApiTags('Departamentos')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Criar novo departamento',
    description: 'Cria um novo departamento no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Departamento criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Listar todos os departamentos',
    description: 'Retorna uma lista de todos os departamentos ativos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos retornada com sucesso',
  })
  async findAll(
    @Query() query?: any,
  ): Promise<FindWithQueryResult<Department>> {
    if (query && Object.keys(query).length > 0) {
      return this.departmentsService.findWithQuery(query);
    }
    return this.departmentsService.findAll();
  }

  @ApiOperation({
    summary: 'Listar departamentos com filtros (público)',
    description:
      'Retorna departamentos com base em filtros complexos via query parameters - endpoint público sem autenticação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos filtradas retornada com sucesso',
  })
  @Get('public')
  async findAllPublic(
    @Query() query?: any,
  ): Promise<FindWithQueryResult<Department>> {
    if (query && Object.keys(query).length > 0) {
      return this.departmentsService.findWithQuery(query);
    }
    return this.departmentsService.findAll();
  }

  @ApiOperation({
    summary: 'Listar departamentos por organização (público)',
    description:
      'Retorna todos os departamentos ativos de uma organização específica - endpoint público sem autenticação',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos retornada com sucesso',
  })
  @Get('public/organization/:organizationId')
  async findByOrganizationPublic(
    @Param('organizationId') organizationId: string,
  ): Promise<Department[]> {
    return this.departmentsService.findByOrganizationId(organizationId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar departamento por ID',
    description: 'Retorna um departamento específico pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do departamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Departamento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  async findById(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findById(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Buscar departamento por slug',
    description: 'Retorna um departamento específico pelo slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do departamento',
    example: 'rh',
  })
  @ApiResponse({
    status: 200,
    description: 'Departamento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Department> {
    return this.departmentsService.findBySlug(slug);
  }

  @ApiOperation({
    summary: 'Buscar departamento por slug (público)',
    description:
      'Retorna um departamento específico pelo slug - endpoint público sem autenticação',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do departamento',
    example: 'rh',
  })
  @ApiResponse({
    status: 200,
    description: 'Departamento encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  @Get('public/slug/:slug')
  async findBySlugPublic(@Param('slug') slug: string): Promise<Department> {
    return this.departmentsService.findBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('organization/:organizationId')
  @ApiOperation({
    summary: 'Buscar departamentos por organização',
    description: 'Retorna todos os departamentos de uma organização específica',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos da organização',
  })
  async findByOrganizationId(
    @Param('organizationId') organizationId: string,
  ): Promise<Department[]> {
    return this.departmentsService.findByOrganizationId(organizationId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('associate-profile')
  @ApiOperation({
    summary: 'Associar perfil a departamento',
    description: 'Associa um perfil a um departamento específico',
  })
  @ApiBody({
    type: AssociateProfileToDepartmentDto,
    description: 'Dados para associar perfil ao departamento',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil associado ao departamento com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  async associateProfileToDepartment(
    @Body() associateProfileToDepartmentDto: AssociateProfileToDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.associateProfileToDepartment(
      associateProfileToDepartmentDto,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar departamento',
    description: 'Atualiza os dados de um departamento existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do departamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Departamento atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Remover departamento',
    description: 'Remove um departamento do sistema (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do departamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Departamento removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  async remove(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('organization/:organizationId/department')
  @ApiOperation({
    summary: 'Criar departamento por nome em organização',
    description:
      'Cria ou reativa um departamento em uma organização específica',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Departamento criado ou reativado com sucesso',
  })
  async createByOrganization(
    @Param('organizationId') organizationId: string,
    @Body() body: { name: string; slug: string },
  ): Promise<Department> {
    console.log('body22222222222222', body);
    return this.departmentsService.create({
      name: body.name,
      slug: body.slug,
      organizationId: organizationId,
    });
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('organization/:organizationId/department/:name')
  @ApiOperation({
    summary: 'Remover departamento por nome',
    description:
      'Remove um departamento pelo nome em uma organização específica (soft delete)',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome do departamento',
    example: 'Recursos Humanos',
  })
  @ApiResponse({
    status: 200,
    description: 'Departamento removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Departamento não encontrado',
  })
  async removeByName(
    @Param('organizationId') organizationId: string,
    @Param('name') name: string,
  ): Promise<Department> {
    return this.departmentsService.removeByName(
      decodeURIComponent(name),
      organizationId,
    );
  }
}
