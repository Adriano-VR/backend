import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTarefaDto, UpdateTarefaDto, TarefaResponse } from '../types/tarefa'
import { TarefaStatus } from '@prisma/client'

@Injectable()
export class TarefaService {
  constructor(private prisma: PrismaService) {}

  async create(createTarefaDto: CreateTarefaDto): Promise<TarefaResponse> {
    // Verificar se o projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: createTarefaDto.projectId }
    })

    if (!project) {
      throw new NotFoundException('Projeto não encontrado')
    }

    const tarefa = await this.prisma.tarefa.create({
      data: {
        titulo: createTarefaDto.titulo,
        descricao: createTarefaDto.descricao,
        responsavel: createTarefaDto.responsavel,
        dataInicio: createTarefaDto.dataInicio,
        dataPrevisaoConclusao: createTarefaDto.dataPrevisaoConclusao,
        projectId: createTarefaDto.projectId
      }
    })

    return tarefa
  }

  async findAll(projectId?: string): Promise<TarefaResponse[]> {
    const where = projectId ? { projectId } : {}

    const tarefas = await this.prisma.tarefa.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return tarefas
  }

  async findOne(id: string): Promise<TarefaResponse> {
    const tarefa = await this.prisma.tarefa.findUnique({
      where: { id }
    })

    if (!tarefa) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return tarefa
  }

  async update(id: string, updateTarefaDto: UpdateTarefaDto): Promise<TarefaResponse> {
    // Verificar se a tarefa existe
    const existingTarefa = await this.prisma.tarefa.findUnique({
      where: { id }
    })

    if (!existingTarefa) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    // Se o status for "concluido", definir dataConclusao automaticamente
    const updateData = { ...updateTarefaDto }
    if (updateTarefaDto.status === 'concluido' && !updateTarefaDto.dataConclusao) {
      updateData.dataConclusao = new Date()
    }

    const tarefa = await this.prisma.tarefa.update({
      where: { id },
      data: updateData
    })

    return tarefa
  }

  async remove(id: string): Promise<void> {
    const tarefa = await this.prisma.tarefa.findUnique({
      where: { id }
    })

    if (!tarefa) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    await this.prisma.tarefa.delete({
      where: { id }
    })
  }

  async findByProject(projectId: string): Promise<TarefaResponse[]> {
    const tarefas = await this.prisma.tarefa.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    return tarefas
  }

  async updateStatus(id: string, status: string): Promise<TarefaResponse> {
    const validStatuses = ['pendente', 'iniciado', 'concluido', 'cancelado']
    
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Status inválido')
    }

    const updateData: any = { status }
    
    // Se o status for "concluido", definir dataConclusao automaticamente
    if (status === 'concluido') {
      updateData.dataConclusao = new Date()
    }

    const tarefa = await this.prisma.tarefa.update({
      where: { id },
      data: updateData
    })

    return tarefa
  }
}
