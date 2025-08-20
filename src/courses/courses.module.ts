import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CourseRepository } from '../repositories/course-repositorie';
import { PrismaCourseRepository } from '../repositories/prisma/prisma-course-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    {
      provide: CourseRepository,
      useClass: PrismaCourseRepository,
    },
  ],
  exports: [CoursesService, CourseRepository],
})
export class CoursesModule {}
