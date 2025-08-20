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
import { Course } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@ApiTags('Cursos')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo curso',
    description: 'Cria um novo curso no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Curso criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os cursos',
    description: 'Retorna uma lista de todos os cursos ativos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos retornada com sucesso',
  })
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Course>> {
    if (query && Object.keys(query).length > 0) {
      return this.coursesService.findWithQuery(query);
    }

    return this.coursesService.findAll();
  }

  @Get('public')
  @ApiOperation({
    summary: 'Listar todos os cursos públicos',
    description:
      'Retorna uma lista de todos os cursos ativos - endpoint público sem autenticação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos públicos retornada com sucesso',
  })
  async findAllPublic(
    @Query() query?: any,
  ): Promise<FindWithQueryResult<Course>> {
    if (query && Object.keys(query).length > 0) {
      return this.coursesService.findWithQuery(query);
    }

    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar curso por ID',
    description: 'Retorna um curso específico pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  async findById(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Buscar curso por slug',
    description: 'Retorna um curso específico pelo slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do curso',
    example: 'desenvolvimento-web-com-react-123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Course> {
    return this.coursesService.findBySlug(slug);
  }

  @Get('trail/:trailId')
  @ApiOperation({
    summary: 'Buscar cursos por trilha',
    description: 'Retorna todos os cursos de uma trilha específica',
  })
  @ApiParam({
    name: 'trailId',
    description: 'ID da trilha',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Cursos da trilha encontrados',
  })
  async findByTrailId(@Param('trailId') trailId: string): Promise<Course[]> {
    return this.coursesService.findByTrailId(trailId);
  }

  @Get(':id/with-modules')
  @ApiOperation({
    summary: 'Buscar curso com módulos',
    description: 'Retorna um curso específico com seus módulos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso com módulos encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  async findWithModules(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findWithModules(id);
  }

  @Get(':id/with-modules-and-lessons')
  @ApiOperation({
    summary: 'Buscar curso com módulos e lições',
    description: 'Retorna um curso específico com seus módulos e lições',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso com módulos e lições encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  async findWithModulesAndLessons(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findWithModulesAndLessons(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar curso',
    description: 'Atualiza um curso existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover curso',
    description: 'Remove um curso (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  async remove(@Param('id') id: string): Promise<Course> {
    return this.coursesService.remove(id);
  }
}
