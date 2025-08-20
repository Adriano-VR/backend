import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaTrailRepository } from '../repositories/prisma/prisma-trail-repositorie';
import { TrailRepository } from '../repositories/trail-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { TrailsController } from './trails.controller';
import { TrailsService } from './trails.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [TrailsController],
  providers: [
    TrailsService,
    {
      provide: TrailRepository,
      useClass: PrismaTrailRepository,
    },
  ],
  exports: [TrailsService, TrailRepository],
})
export class TrailsModule {}
