import { TaskStatus } from '@prisma/client'

export interface CreateTaskDto {
  titulo: string
  descricao?: string
  responsavel?: string
  dataInicio?: Date
  dataPrevisaoConclusao?: Date
  projectId: string
}

export interface UpdateTaskDto {
  titulo?: string
  descricao?: string
  responsavel?: string
  dataInicio?: Date
  dataPrevisaoConclusao?: Date
  dataConclusao?: Date
  status?: TaskStatus
}

export interface TaskResponse {
  id: string
  titulo: string
  descricao: string | null
  responsavel: string | null
  dataInicio: Date | null
  dataPrevisaoConclusao: Date | null
  dataConclusao: Date | null
  status: TaskStatus
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export { TaskStatus }
