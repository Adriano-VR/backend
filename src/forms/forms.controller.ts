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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { Form } from '../../prisma/types';
import { CloneFormDto } from './dto/clone-form-dto';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormsService } from './forms.service';

@ApiTags('Forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({
    summary: 'Criar um novo formulário',
    description: 'Cria um novo formulário no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Formulário criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFormDto: CreateFormDto): Promise<Form> {
    return this.formsService.create(createFormDto);
  }

  @ApiOperation({
    summary: 'Listar todos os formulários',
    description: 'Retorna uma lista com todos os formulários cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de formulários retornada com sucesso',
  })
  @Get()
  async findAll(@Query() query?: any): Promise<FindWithQueryResult<Form>> {
    // Se houver query parameters, usar busca com filtros
    if (query && Object.keys(query).length > 0) {
      console.log(query, `query-FormsController`);
      return this.formsService.findWithQuery(query);
    }
    // Caso contrário, retornar todas
    return this.formsService.findAll();
  }

  @ApiOperation({
    summary: 'Buscar formulários públicos',
    description:
      'Retorna uma lista com todos os formulários públicos cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de formulários públicos retornada com sucesso',
  })
  @Get('public')
  async findPublicForms(): Promise<Form[]> {
    console.log('findPublicForms');
    try {
      const forms = await this.formsService.findPublicForms();
      console.log('✅ findPublicForms executado com sucesso:', forms.length);
      return forms;
    } catch (error) {
      console.error('❌ Erro em findPublicForms:', error);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Buscar formulário por ID',
    description: 'Retorna um formulário específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do formulário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Formulário encontrado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulário não encontrado',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Form> {
    return this.formsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Clonar formulário',
    description: 'Clona um formulário para uma organização específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Formulário clonado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @Post('clone')
  async cloneForm(@Body() cloneFormDto: CloneFormDto): Promise<Form[]> {
    console.log(cloneFormDto, `cloneFormDto`);
    return this.formsService.cloneForm(cloneFormDto);
  }

  @ApiOperation({
    summary: 'Atualizar formulário por ID',
    description: 'Atualiza os dados de um formulário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do formulário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Formulário atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulário não encontrado',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
  ): Promise<Form> {
    return this.formsService.update(id, updateFormDto);
  }

  @ApiOperation({
    summary: 'Deletar formulário por ID',
    description: 'Remove um formulário específico do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do formulário',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Formulário deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulário não encontrado',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.formsService.remove(id);
  }

  @Post('organization/:organizationId/template/:templateId')
  @ApiOperation({
    summary: 'Criar formulário por template em organização',
    description:
      'Cria ou reativa um formulário baseado em um template para uma organização específica',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'templateId',
    description: 'ID do template de formulário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Formulário criado ou reativado com sucesso',
  })
  async createByTemplate(
    @Param('organizationId') organizationId: string,
    @Param('templateId') templateId: string,
    @Body() body: { createdById: string; limitDate?: string },
  ): Promise<Form[]> {
    console.log(body, `"createByTemplate"`);
    return this.formsService.createByTemplate(
      templateId,
      organizationId,
      body.createdById,
      body.limitDate,
    );
  }

  @Delete('organization/:organizationId/template/:templateId')
  @ApiOperation({
    summary: 'Remover formulário por template',
    description:
      'Remove um formulário baseado em um template de uma organização específica (soft delete)',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID da organização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'templateId',
    description: 'ID do template de formulário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Formulário removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulário não encontrado',
  })
  async removeByTemplate(
    @Param('organizationId') organizationId: string,
    @Param('templateId') templateId: string,
  ): Promise<Form> {
    return this.formsService.removeByTemplate(templateId, organizationId);
  }


}
