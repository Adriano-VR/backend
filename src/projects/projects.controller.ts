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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(createProjectDto, req.user.sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query('organizationId') organizationId?: string): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll(organizationId);
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  async getProjectStats(): Promise<any> {
    return this.projectsService.getProjectStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.projectsService.remove(id);
    return { message: 'Projeto removido com sucesso' };
  }
}
