import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectType, TaskStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface ChecklistData {
  title: string;
  description: string;
  type: string;
  phases: {
    [key: string]: {
      title: string;
      description: string;
      tarefas: Array<{
        titulo: string;
        descricao: string;
        responsavel: string;
        prazo: string;
        status: string;
        prioridade: string;
      }>;
    };
  };
  metas: {
    [key: string]: string;
  };
  legislacoes: string[];
}

@Injectable()
export class ChecklistProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async createChecklistProject(campaignId: string, organizationId: string, createdById?: string): Promise<any> {
    try {
      console.log('🔍 [ChecklistProjectService] Criando projeto de checklist para campanha:', campaignId);
      console.log('🔍 [ChecklistProjectService] createdById recebido:', createdById);

      // Carregar dados do checklist do arquivo JSON
      const checklistData = await this.loadChecklistData();

      // Verificar se já existe um projeto de checklist para esta campanha
      const existingProject = await this.prisma.project.findFirst({
        where: {
          campaigns: {
            some: {
              id: campaignId
            }
          },
          type: 'checklist',
          title: { contains: 'SST' }
        }
      });

      if (existingProject) {
        console.log('✅ [ChecklistProjectService] Projeto de checklist já existe para esta campanha');
        return existingProject;
      }

      // Criar o projeto
      const project = await this.prisma.project.create({
        data: {
          title: checklistData.title,
          slug: `sst-pdca-checklist-${Date.now()}`,
          type: 'checklist' as ProjectType,
          description: checklistData.description,
          organizationId: organizationId,
          campaignId: campaignId, // Relação direta
          createdById: createdById, // ID do usuário que criou
          campaigns: {
            connect: {
              id: campaignId
            }
          },
          status: 'pending'
        }
      });

      console.log('✅ [ChecklistProjectService] Projeto criado:', project.title);

      // Criar tarefas para cada fase do PDCA
      let totalTarefas = 0;

      for (const [phaseKey, phase] of Object.entries(checklistData.phases)) {
        console.log(`📋 [ChecklistProjectService] Criando tarefas da fase: ${phase.title}`);

        for (const tarefaData of phase.tarefas) {
          // Converter prazo para data
          let dataPrevisaoConclusao: Date | null = null;

          if (tarefaData.prazo !== 'Contínuo' && !tarefaData.prazo.includes('após')) {
            const dias = parseInt(tarefaData.prazo.split(' ')[0]);
            if (!isNaN(dias)) {
              dataPrevisaoConclusao = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
            }
          }

          // Mapear prioridade para status
          let status: TaskStatus = 'pendente';
          if (tarefaData.prioridade === 'alta') {
            status = 'pendente';
          } else if (tarefaData.prioridade === 'média') {
            status = 'pendente';
          }

          const task = await this.prisma.task.create({
            data: {
              titulo: tarefaData.titulo,
              descricao: tarefaData.descricao,
              responsavel: tarefaData.responsavel,
              dataInicio: new Date(),
              dataPrevisaoConclusao,
              status,
              projectId: project.id
            }
          });

          totalTarefas++;
          console.log(`  ✅ [ChecklistProjectService] Tarefa criada: ${task.titulo}`);
        }
      }

      console.log(`🎉 [ChecklistProjectService] Projeto de checklist criado com sucesso! ${totalTarefas} tarefas criadas.`);

      return project;
    } catch (error) {
      console.error('❌ [ChecklistProjectService] Erro ao criar projeto de checklist:', error);
      throw error;
    }
  }

  private async loadChecklistData(): Promise<ChecklistData> {
    try {
      const filePath = path.join(process.cwd(), 'prisma', 'seeds', 'sst-pdca-checklist.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('❌ [ChecklistProjectService] Erro ao carregar dados do checklist:', error);
      throw new Error('Não foi possível carregar os dados do checklist');
    }
  }
}
