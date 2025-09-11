import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotificationsByUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        profileId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limitar a 10 notificações mais recentes
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        profileId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        profileId: userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }
}


