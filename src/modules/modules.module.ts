import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ModuleRepository } from '../repositories/module-repositorie';
import { PrismaModuleRepository } from '../repositories/prisma/prisma-module-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [ModulesController],
  providers: [
    ModulesService,
    {
      provide: ModuleRepository,
      useClass: PrismaModuleRepository,
    },
  ],
  exports: [ModulesService, ModuleRepository],
})
export class ModulesModule {}
