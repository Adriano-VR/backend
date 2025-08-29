import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CampaignDocumentsService } from './campaign-documents.service';
import { CreateCampaignDocumentDto, UpdateCampaignDocumentDto } from './campaign-documents.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('campaigns/:campaignId/documents')
export class CampaignDocumentsController {
  constructor(private readonly campaignDocumentsService: CampaignDocumentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Param('campaignId') campaignId: string,
    @Body() createDocumentDto: CreateCampaignDocumentDto,
    @Request() req: any,
  ) {
    return this.campaignDocumentsService.create(
      { ...createDocumentDto, campaignId },
      req.user.id,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Param('campaignId') campaignId: string) {
    return this.campaignDocumentsService.findAll(campaignId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.campaignDocumentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateCampaignDocumentDto,
  ) {
    return this.campaignDocumentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    await this.campaignDocumentsService.remove(id);
    return { message: 'Documento removido com sucesso' };
  }
}
