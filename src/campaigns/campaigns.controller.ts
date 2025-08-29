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
  Query,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}



  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @Request() req: any,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.create(createCampaignDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query('organizationId') organizationId?: string): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findAll(organizationId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<CampaignResponseDto> {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(AuthGuard)
  async getCampaignStats(@Param('id') id: string): Promise<any> {
    return this.campaignsService.getCampaignStats(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.campaignsService.remove(id);
    return { message: 'Campanha removida com sucesso' };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Buscar frequência de aplicação de um formulário',
    description: 'Retorna a frequência de aplicação baseada na campanha do formulário',
  })
  @ApiParam({
    name: 'formId',
    description: 'ID único do formulário',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Frequência encontrada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Formulário ou campanha não encontrada',
  })
  @Get('forms/:formId/frequency')
  async getFormApplicationFrequency(@Param('formId') formId: string): Promise<any> {
    return this.campaignsService.getFormApplicationFrequency(formId);
  }
}


