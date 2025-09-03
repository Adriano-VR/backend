import { TarefaStatus } from '@prisma/client'

export interface CreateTarefaDto {
  titulo: string
  descricao?: string
  responsavel?: string
  dataInicio?: Date
  dataPrevisaoConclusao?: Date
  projectId: string
}

export interface UpdateTarefaDto {
  titulo?: string
  descricao?: string
  responsavel?: string
  dataInicio?: Date
  dataPrevisaoConclusao?: Date
  dataConclusao?: Date
  status?: TarefaStatus
}

export interface TarefaResponse {
  id: string
  titulo: string
  descricao: string | null
  responsavel: string | null
  dataInicio: Date | null
  dataPrevisaoConclusao: Date | null
  dataConclusao: Date | null
  status: TarefaStatus
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export { TarefaStatus }
