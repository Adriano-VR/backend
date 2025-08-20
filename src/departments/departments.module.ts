import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DepartmentRepository } from '../repositories/department-repositorie';
import { PrismaDepartmentRepository } from '../repositories/prisma/prisma-department-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [DepartmentsController],
  providers: [
    DepartmentsService,
    {
      provide: DepartmentRepository,
      useClass: PrismaDepartmentRepository,
    },
  ],
  exports: [DepartmentsService, DepartmentRepository],
})
export class DepartmentsModule {}
