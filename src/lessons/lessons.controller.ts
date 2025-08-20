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
import { Lesson } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { LessonsService } from './lessons.service';

@ApiTags('Lições')
@Controller('lessons')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova lição',
    description: 'Cria uma nova lição no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Lição criada com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as lições',
    description: 'Retorna uma lista de todas as lições ativas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lições retornada com sucesso',
  })
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Lesson>> {
    if (query && Object.keys(query).length > 0) {
      return this.lessonsService.findWithQuery(query);
    }

    return this.lessonsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar lição por ID',
    description: 'Retorna uma lição específica pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da lição',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lição encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Lição não encontrada',
  })
  async findById(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Buscar lição por slug',
    description: 'Retorna uma lição específica pelo slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único da lição',
    example: 'introducao-ao-react-hooks-123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Lição encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Lição não encontrada',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Lesson> {
    return this.lessonsService.findBySlug(slug);
  }

  @Get('module/:moduleId')
  @ApiOperation({
    summary: 'Buscar lições por módulo',
    description: 'Retorna todas as lições de um módulo específico',
  })
  @ApiParam({
    name: 'moduleId',
    description: 'ID do módulo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lições do módulo encontradas',
  })
  async findByModuleId(@Param('moduleId') moduleId: string): Promise<Lesson[]> {
    return this.lessonsService.findByModuleId(moduleId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar lição',
    description: 'Atualiza uma lição existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da lição',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lição atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Lição não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover lição',
    description: 'Remove uma lição (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da lição',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lição removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Lição não encontrada',
  })
  async remove(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.remove(id);
  }
}
