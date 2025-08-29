import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignDocumentsService } from './campaign-documents.service';
import { CampaignDocumentsController } from './campaign-documents.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignsController, CampaignDocumentsController],
  providers: [CampaignsService, CampaignDocumentsService],
  exports: [CampaignsService, CampaignDocumentsService],
})
export class CampaignsModule {}
