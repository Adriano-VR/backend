import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FormRepository } from '../repositories/form-repositorie';
import { PrismaFormRepository } from '../repositories/prisma/prisma-form-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormsAnalysisController } from './analysis/forms.analysis.controller';
import { FormsAnalysisService } from './analysis/forms.analysis.service';
import { FormsQsService } from './analysis/forms.qs.service';
@Module({
  imports: [PrismaModule, QueryParserModule, NotificationsModule],
  controllers: [FormsController, FormsAnalysisController],
  providers: [
    FormsService,
    FormsAnalysisService,
    FormsQsService,
    {
      provide: FormRepository,
      useClass: PrismaFormRepository,
    },
  ],
  exports: [FormsService, FormRepository],
})
export class FormsModule {}
