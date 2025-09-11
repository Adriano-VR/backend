import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto, UpdateTaskDto, TaskResponse } from '../types/task'
import { TaskStatus } from '@prisma/client'

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    // Verificar se o projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId }
    })

    if (!project) {
      throw new NotFoundException('Projeto não encontrado')
    }

    const task = await this.prisma.task.create({
      data: {
        titulo: createTaskDto.titulo,
        descricao: createTaskDto.descricao,
        responsavel: createTaskDto.responsavel,
        dataInicio: createTaskDto.dataInicio,
        dataPrevisaoConclusao: createTaskDto.dataPrevisaoConclusao,
        projectId: createTaskDto.projectId
      }
    })

    return task
  }

  async findAll(projectId?: string): Promise<TaskResponse[]> {
    const where = projectId ? { projectId } : {}

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return tasks
  }

  async findOne(id: string): Promise<TaskResponse> {
    const task = await this.prisma.task.findUnique({
      where: { id }
    })

    if (!task) {
      throw new NotFoundException('Task não encontrada')
    }

    return task
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskResponse> {
    // Verificar se a task existe
    const existingTask = await this.prisma.task.findUnique({
      where: { id }
    })

    if (!existingTask) {
      throw new NotFoundException('Task não encontrada')
    }

    // Se o status for "concluido", definir dataConclusao automaticamente
    const updateData = { ...updateTaskDto }
    if (updateTaskDto.status === 'concluido' && !updateTaskDto.dataConclusao) {
      updateData.dataConclusao = new Date()
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData
    })

    return task
  }

  async remove(id: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id }
    })

    if (!task) {
      throw new NotFoundException('Task não encontrada')
    }

    await this.prisma.task.delete({
      where: { id }
    })
  }

  async findByProject(projectId: string): Promise<TaskResponse[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    return tasks
  }

  async updateStatus(id: string, status: string): Promise<TaskResponse> {
    const validStatuses = ['pendente', 'iniciado', 'concluido', 'cancelado']
    
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Status inválido')
    }

    const updateData: any = { status }
    
    // Se o status for "concluido", definir dataConclusao automaticamente
    if (status === 'concluido') {
      updateData.dataConclusao = new Date()
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData
    })

    return task
  }
}
