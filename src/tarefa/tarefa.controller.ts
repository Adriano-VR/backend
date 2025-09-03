import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { TarefaService } from './tarefa.service'
import { CreateTarefaDto, UpdateTarefaDto, TarefaResponse } from '../types/tarefa'
import { AuthGuard } from '../auth/auth.guard'

@Controller('tarefas')
@UseGuards(AuthGuard)
export class TarefaController {
  constructor(private readonly tarefaService: TarefaService) {}

  @Post()
  create(@Body() createTarefaDto: CreateTarefaDto): Promise<TarefaResponse> {
    return this.tarefaService.create(createTarefaDto)
  }

  @Get()
  findAll(@Query('projectId') projectId?: string): Promise<TarefaResponse[]> {
    return this.tarefaService.findAll(projectId)
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TarefaResponse> {
    return this.tarefaService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTarefaDto: UpdateTarefaDto): Promise<TarefaResponse> {
    return this.tarefaService.update(id, updateTarefaDto)
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string): Promise<TarefaResponse> {
    return this.tarefaService.updateStatus(id, status)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.tarefaService.remove(id)
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string): Promise<TarefaResponse[]> {
    return this.tarefaService.findByProject(projectId)
  }
}
