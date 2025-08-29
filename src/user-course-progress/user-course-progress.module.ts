import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserCourseProgressController } from './user-course-progress.controller';
import { UserCourseProgressService } from './user-course-progress.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserCourseProgressController],
  providers: [UserCourseProgressService],
  exports: [UserCourseProgressService],
})
export class UserCourseProgressModule {}


