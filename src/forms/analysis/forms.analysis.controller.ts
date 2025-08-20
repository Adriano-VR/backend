import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import { FormsAnalysisService } from './forms.analysis.service';

@Controller('forms')
export class FormsAnalysisController {
  constructor(private readonly formsAnalysisService: FormsAnalysisService) {}

  @Get(':uid/overview')
  async getOverview(@Param('uid') uid: string) {
    return this.formsAnalysisService.getOverview(uid);
  }

  @Get(':id/dimensions')
  async getDimensionsByForm(@Param('id') id: string) {
    return this.formsAnalysisService.getDimensionsByForm(id);
  }

  @Get(':id/radar')
  async getRadarData(@Param('id') id: string) {
    return this.formsAnalysisService.getDomainsByForm(id);
  }

  @Get(':uid/departments')
  async getDepartmentsByForm(@Param('uid') uid: string) {
    return this.formsAnalysisService.getDepartmentsByForm(uid);
  }

  @Get(':uid/responses')
  async getAllResponses(@Param('uid') uid: string) {
    return this.formsAnalysisService.getResponseDetailsByDepartment(uid);
  }

  // Rota para respostas de um departamento específico
  @Get(':uid/responses/department/:department')
  async getResponsesByDepartment(
    @Param('uid') uid: string,
    @Param('department') department: string,
  ) {
    return this.formsAnalysisService.getResponseDetailsByDepartment(
      uid,
      department,
    );
  }

  @Get(':formId/recommendations')
  async getRecommendationsByForm(
    @Param('formId') formId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.formsAnalysisService.getRecommendationsByForm(
      formId,
      start,
      end,
    );
  }
}
