import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { FormAnalyticsResult } from './dto/form-analytics-result.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('forms/:formId/overview')
  async getFormOverview(@Param('formId') formId: string) {
    return this.analyticsService.getFormOverview(formId);
  }

  @Get('forms/:formId/by-department/:departmentId')
  async getFormByDepartment(
    @Param('formId') formId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return this.analyticsService.getFormByDepartment(formId, departmentId);
  }

  @Get('forms/:formId/employee/:employeeId')
  async getFormEmployee(
    @Param('formId') formId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.analyticsService.getFormEmployee(formId, employeeId);
  }

  @Get('forms/:id/alerts')
  async getFormAlerts(@Param('id') formId: string) {
    return this.analyticsService.getFormAlerts(formId);
  }

  @Get('forms/:formId/grouped-analytics')
  async getGroupedAnalytics(
    @Param('formId') formId: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getGroupedAnalytics(formId, department);
  }
}
