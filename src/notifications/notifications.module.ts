import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RoleBasedNotificationsService } from './role-based-notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, RoleBasedNotificationsService],
  exports: [NotificationsService, RoleBasedNotificationsService],
})
export class NotificationsModule {}


