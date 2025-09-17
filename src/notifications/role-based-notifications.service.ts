import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { Role } from '@prisma/client';

export interface NotificationConfig {
  title: string;
  message: string;
  roles: Role[];
  organizationId: string;
}

@Injectable()
export class RoleBasedNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Envia notificação para usuários com roles específicos em uma organização
   */
  async sendNotificationToRoles(config: NotificationConfig): Promise<void> {
    try {


      // Buscar usuários com os roles especificados na organização
      const users = await this.prisma.organizationMember.findMany({
        where: {
          organizationId: config.organizationId,
          role: {
            in: config.roles
          },
          status: {
            in: ['active', 'pending']
          },
        },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      if (users.length === 0) {
        return;
      }

      // Criar notificação para cada usuário
      for (const user of users) {
        await this.notificationsService.createNotification({
          profileId: user.profileId,
          title: config.title,
          message: config.message,
        });
      }
    } catch (error) {
      console.error('❌ [RoleBasedNotifications] Erro ao enviar notificações:', error);
    }
  }

  /**
   * Envia notificação apenas para colaboradores
   */
  async notifyCollaborators(organizationId: string, title: string, message: string): Promise<void> {
    await this.sendNotificationToRoles({
      title,
      message,
      roles: ['collaborator'],
      organizationId,
    });
  }

  /**
   * Envia notificação apenas para administradores
   */
  async notifyAdmins(organizationId: string, title: string, message: string): Promise<void> {
    await this.sendNotificationToRoles({
      title,
      message,
      roles: ['admin'],
      organizationId,
    });
  }

  /**
   * Envia notificação apenas para profissionais
   */
  async notifyProfessionals(organizationId: string, title: string, message: string): Promise<void> {
    await this.sendNotificationToRoles({
      title,
      message,
      roles: ['professional'],
      organizationId,
    });
  }

  /**
   * Envia notificação para colaboradores e profissionais
   */
  async notifyCollaboratorsAndProfessionals(organizationId: string, title: string, message: string): Promise<void> {
    await this.sendNotificationToRoles({
      title,
      message,
      roles: ['collaborator', 'professional'],
      organizationId,
    });
  }

  /**
   * Envia notificação para todos os usuários da organização
   */
  async notifyAll(organizationId: string, title: string, message: string): Promise<void> {
    await this.sendNotificationToRoles({
      title,
      message,
      roles: ['admin', 'collaborator', 'professional'],
      organizationId,
    });
  }
}