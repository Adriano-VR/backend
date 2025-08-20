import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LessonRepository } from '../repositories/lesson-repositorie';
import { PrismaLessonRepository } from '../repositories/prisma/prisma-lesson-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    {
      provide: LessonRepository,
      useClass: PrismaLessonRepository,
    },
  ],
  exports: [LessonsService, LessonRepository],
})
export class LessonsModule {}
