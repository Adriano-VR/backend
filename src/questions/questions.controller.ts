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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Question } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Criar uma nova pergunta',
    description: 'Cria uma nova pergunta no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Pergunta criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionsService.create(createQuestionDto);
  }

  @ApiOperation({
    summary: 'Listar todas as perguntas',
    description: 'Retorna uma lista com todas as perguntas cadastradas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perguntas retornada com sucesso',
  })
  @Get()
  async findAll(): Promise<Question[]> {
    console.log('findAll');
    return this.questionsService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar pergunta por ID',
    description: 'Retorna uma pergunta específica pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da pergunta',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Pergunta encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pergunta não encontrada',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Question> {
    return this.questionsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Buscar perguntas por formulário',
    description: 'Retorna todas as perguntas de um formulário específico',
  })
  @ApiParam({
    name: 'formId',
    description: 'ID único do formulário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Perguntas do formulário retornadas com sucesso',
  })
  @Get('form/:formId')
  async findByFormId(@Param('formId') formId: string): Promise<Question[]> {
    return this.questionsService.findByFormId(formId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar pergunta por ID',
    description: 'Atualiza os dados de uma pergunta específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da pergunta',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Pergunta atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pergunta não encontrada',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletar pergunta por ID',
    description: 'Remove uma pergunta específica do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da pergunta',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Pergunta deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pergunta não encontrada',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<void> {
    await this.questionsService.remove(id);
  }
}
