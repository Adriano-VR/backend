import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    const userId = req.user.id;
    return this.notificationsService.getNotificationsByUserId(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }
}
