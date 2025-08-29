import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressStatus } from '@prisma/client';

export interface CreateUserCourseProgressDto {
  profileId: string;
  courseId: string;
  lessonId?: string;
  status?: ProgressStatus;
  progress?: number;
  details?: any;
}

export interface UpdateUserCourseProgressDto {
  lessonId?: string;
  status?: ProgressStatus;
  progress?: number;
  details?: any;
}

@Injectable()
export class UserCourseProgressService {
  constructor(private prisma: PrismaService) {}

  async createProgress(data: CreateUserCourseProgressDto) {
    return this.prisma.userCourseProgress.create({
      data: {
        profileId: data.profileId,
        courseId: data.courseId,
        status: data.status || 'in_progress',
        progress: data.progress || 0,
        details: data.details || {},
      },
      include: {
        course: true,
        profile: true,
      },
    });
  }

  async getProgress(profileId: string, courseId: string) {
    return this.prisma.userCourseProgress.findUnique({
      where: {
        profileId_courseId: {
          profileId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        profile: true,
      },
    });
  }

  async updateProgress(profileId: string, courseId: string, data: UpdateUserCourseProgressDto) {
    console.log('🔍 [Service] updateProgress chamado com:', { profileId, courseId, data })
    
    const existingProgress = await this.getProgress(profileId, courseId);
    console.log('🔍 [Service] Progresso existente:', existingProgress)
    
    if (!existingProgress) {
      console.log('🔍 [Service] Criando novo progresso...')
      // Se não existir progresso, criar um novo
      const newProgress = await this.createProgress({
        profileId,
        courseId,
        status: data.status || 'in_progress',
        progress: data.progress || 0,
        details: data.details || {},
      });
      console.log('✅ [Service] Novo progresso criado:', newProgress)
      return newProgress
    }

    // Calcular novo progresso baseado nas aulas concluídas
    let newProgress = existingProgress.progress || 0;
    let newStatus = existingProgress.status;
    let shouldUpdateCompletedAt = false;

    if (data.lessonId) {
      const course = existingProgress.course;
      const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      
      // Adicionar aula concluída aos detalhes
      const details = existingProgress.details as any || {};
      const completedLessons = details.completedLessons || [];
      
      if (!completedLessons.includes(data.lessonId)) {
        completedLessons.push(data.lessonId);
        details.completedLessons = completedLessons;
        
        // Calcular novo progresso
        newProgress = Math.round((completedLessons.length / totalLessons) * 100);
        
        // Atualizar status se necessário
        if (newProgress >= 100) {
          newStatus = 'completed';
          shouldUpdateCompletedAt = true;
        } else if (newProgress > 0) {
          newStatus = 'in_progress';
        }
      }
    }

    return this.prisma.userCourseProgress.update({
      where: {
        profileId_courseId: {
          profileId,
          courseId,
        },
      },
      data: {
        status: data.status || newStatus,
        progress: data.progress !== undefined ? data.progress : newProgress,
        details: data.details || existingProgress.details,
        completedAt: shouldUpdateCompletedAt ? new Date() : existingProgress.completedAt,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        profile: true,
      },
    });
  }

  async completeLesson(profileId: string, courseId: string, lessonId: string) {
    console.log('🔍 [Service] completeLesson chamado com:', { profileId, courseId, lessonId })
    
    // Buscar progresso existente para preservar completedLessons
    const existingProgress = await this.getProgress(profileId, courseId);
    const existingDetails = existingProgress?.details as any || {};
    const existingCompletedLessons = existingDetails.completedLessons || [];
    
    // Adicionar a aula atual ao array completedLessons se não estiver lá
    if (!existingCompletedLessons.includes(lessonId)) {
      existingCompletedLessons.push(lessonId);
    }
    
    // Criar novos detalhes com o array completedLessons atualizado
    const newDetails = {
      ...existingDetails,
      completedLessons: existingCompletedLessons,
      lastCompletedLesson: lessonId,
      lastCompletedAt: new Date().toISOString(),
    };
    
    console.log('🔍 [Service] Detalhes atualizados:', newDetails)
    
    const result = await this.updateProgress(profileId, courseId, {
      lessonId,
      details: newDetails,
    });
    
    console.log('✅ [Service] completeLesson resultado:', result)
    return result
  }

  async getProgressByProfile(profileId: string) {
    return this.prisma.userCourseProgress.findMany({
      where: {
        profileId,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteProgress(profileId: string, courseId: string) {
    return this.prisma.userCourseProgress.delete({
      where: {
        profileId_courseId: {
          profileId,
          courseId,
        },
      },
    });
  }
}

