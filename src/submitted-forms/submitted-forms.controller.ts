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
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubmittedForm } from '../../prisma/types';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSubmittedFormDto } from './dto/create-submitted-form.dto';
import { UpdateSubmittedFormDto } from './dto/update-submitted-form.dto';
import { SubmittedFormsService } from './submitted-forms.service';

@ApiTags('Submitted Forms')
@Controller('submitted-forms')
export class SubmittedFormsController {
  constructor(private readonly submittedFormsService: SubmittedFormsService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Criar uma nova submissão de formulário',
    description: 'Cria uma nova submissão de formulário no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Submissão de formulário criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSubmittedFormDto: CreateSubmittedFormDto,
  ): Promise<SubmittedForm> {
    return this.submittedFormsService.create(createSubmittedFormDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar todas as submissões de formulários',
    description:
      'Retorna uma lista com todas as submissões de formulários cadastradas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de submissões retornada com sucesso',
  })
  @Get()
  async findAll(): Promise<SubmittedForm[]> {
    return this.submittedFormsService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar submissão por ID',
    description: 'Retorna uma submissão específica pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da submissão',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissão encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Submissão não encontrada',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubmittedForm> {
    return this.submittedFormsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Vincular submittedForm a uma campanha',
    description: 'Vincula um submittedForm existente a uma campanha específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do submittedForm',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'SubmittedForm vinculado à campanha com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'SubmittedForm não encontrado',
  })
  @Patch(':id/campaign')
  async linkToCampaign(
    @Param('id') id: string,
    @Body() body: { campaignId: string },
  ): Promise<SubmittedForm> {
    return this.submittedFormsService.linkToCampaign(id, body.campaignId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar submissões por formulário',
    description: 'Retorna todas as submissões de um formulário específico',
  })
  @ApiParam({
    name: 'formId',
    description: 'ID único do formulário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissões do formulário retornadas com sucesso',
  })
  @Get('form/:formId')
  async findByFormId(
    @Param('formId') formId: string,
  ): Promise<SubmittedForm[]> {
    return this.submittedFormsService.findByFormId(formId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar submissões por perfil/usuário',
    description: 'Retorna todas as submissões de um usuário específico',
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID único do perfil/usuário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissões do usuário retornadas com sucesso',
  })
  @Get('profile/:profileId')
  async findByProfileId(
    @Param('profileId') profileId: string,
  ): Promise<SubmittedForm[]> {
    return this.submittedFormsService.findByProfileId(profileId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar submissões por status',
    description: 'Retorna todas as submissões com um status específico',
  })
  @ApiQuery({
    name: 'status',
    description: 'Status da submissão (pending, in_progress, completed)',
    type: 'string',
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissões com o status retornadas com sucesso',
  })
  @Get('status/filter')
  async findByStatus(
    @Query('status') status: string,
  ): Promise<SubmittedForm[]> {
    return this.submittedFormsService.findByStatus(status);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar submissão por ID',
    description: 'Atualiza os dados de uma submissão específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da submissão',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissão atualizada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Submissão não encontrada',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubmittedFormDto: UpdateSubmittedFormDto,
  ): Promise<SubmittedForm> {
    console.log(`🔍 [SubmittedFormsController] Recebendo requisição de update:`, {
      id,
      updateData: updateSubmittedFormDto
    });
    return this.submittedFormsService.update(id, updateSubmittedFormDto);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletar submissão por ID',
    description: 'Remove uma submissão específica do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da submissão',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Submissão deletada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Submissão não encontrada',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.submittedFormsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar submissões por organização',
    description: 'Retorna todas as submissões de uma organização específica',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Submissões da organização retornadas com sucesso',
  })
  @Get('organization/:organizationId')
  async findOrganizationSubmittedForms(
    @Param('organizationId') organizationId: string,
  ): Promise<SubmittedForm[]> {
    return this.submittedFormsService.findOrganizationSubmittedForms(
      organizationId,
    );
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar estatísticas de progresso do usuário',
    description:
      'Retorna estatísticas de formulários completos e total de formulários para um usuário',
  })
  @ApiParam({
    name: 'profileId',
    description: 'ID único do perfil do usuário',
    type: 'string',
  })
  @ApiParam({
    name: 'organizationId',
    description: 'ID único da organização',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de progresso retornadas com sucesso',
  })
  @Get('progress/:profileId/:organizationId')
  async getUserProgressStats(
    @Param('profileId') profileId: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.submittedFormsService.getUserProgressStats(
      profileId,
      organizationId,
    );
  }
}
