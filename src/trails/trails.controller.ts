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
import { Trail } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTrailDto, UpdateTrailDto } from './dto';
import { TrailsService } from './trails.service';

@ApiTags('Trilhas')
@Controller('trails')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova trilha',
    description: 'Cria uma nova trilha no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Trilha criada com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async create(@Body() createTrailDto: CreateTrailDto): Promise<Trail> {
    return this.trailsService.create(createTrailDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as trilhas',
    description: 'Retorna uma lista de todas as trilhas ativas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de trilhas retornada com sucesso',
  })
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Trail>> {
    if (query && Object.keys(query).length > 0) {
      return this.trailsService.findWithQuery(query);
    }

    return this.trailsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar trilha por ID',
    description: 'Retorna uma trilha específica pelo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da trilha',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trilha encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Trilha não encontrada',
  })
  async findById(@Param('id') id: string): Promise<Trail> {
    return this.trailsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Buscar trilha por slug',
    description: 'Retorna uma trilha específica pelo slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único da trilha',
    example: 'trilha-desenvolvimento-web-123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Trilha encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Trilha não encontrada',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Trail> {
    return this.trailsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar trilha',
    description: 'Atualiza uma trilha existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da trilha',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trilha atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Trilha não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito - Slug já existe',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTrailDto: UpdateTrailDto,
  ): Promise<Trail> {
    return this.trailsService.update(id, updateTrailDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover trilha',
    description: 'Remove uma trilha (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da trilha',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trilha removida com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Trilha não encontrada',
  })
  async remove(@Param('id') id: string): Promise<Trail> {
    return this.trailsService.remove(id);
  }
}
