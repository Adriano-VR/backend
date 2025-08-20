import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { answer } from '@prisma/client';

@ApiTags('Answers')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Salvar ou atualizar resposta de uma pergunta' })
  @ApiResponse({ status: 201, description: 'Resposta salva com sucesso' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAnswerDto: CreateAnswerDto): Promise<answer> {
    return this.answersService.create(createAnswerDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar todas as respostas de um formulário submetido',
  })
  @ApiParam({ name: 'submittedFormId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Respostas retornadas com sucesso' })
  @Get('form/:submittedFormId')
  async findBySubmittedFormId(
    @Param('submittedFormId') submittedFormId: string,
  ): Promise<answer[]> {
    return this.answersService.findBySubmittedFormId(submittedFormId);
  }
}
