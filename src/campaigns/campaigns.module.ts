import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignDocumentsService } from './campaign-documents.service';
import { CampaignDocumentsController } from './campaign-documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChecklistProjectService } from '../services/checklist-project.service';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignsController, CampaignDocumentsController],
  providers: [CampaignsService, CampaignDocumentsService, ChecklistProjectService],
  exports: [CampaignsService, CampaignDocumentsService, ChecklistProjectService],
})
export class CampaignsModule {}
