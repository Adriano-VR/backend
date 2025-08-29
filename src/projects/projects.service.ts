import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, createdById: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        createdById,
        type: createProjectDto.type,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            actions: true,
            campaigns: true,
          },
        },
      },
    });

    return this.mapToResponseDto(project);
  }

  async findAll(organizationId?: string): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            actions: true,
            campaigns: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map(project => this.mapToResponseDto(project));
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            actions: true,
            campaigns: true,
          },
        },
        actions: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        campaigns: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projeto com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const { organizationId, ...updateData } = updateProjectDto;
    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            actions: true,
            campaigns: true,
          },
        },
      },
    });

    return this.mapToResponseDto(project);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getProjectStats(): Promise<any> {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalActions,
      totalCampaigns,
    ] = await Promise.all([
      this.prisma.project.count({
        where: { deletedAt: null },
      }),
      this.prisma.project.count({
        where: {
          deletedAt: null,
          status: 'in_progress',
        },
      }),
      this.prisma.project.count({
        where: {
          deletedAt: null,
          status: 'completed',
        },
      }),
      this.prisma.project.count({
        where: {
          deletedAt: null,
          status: 'pending',
        },
      }),
      this.prisma.action.count({
        where: { deletedAt: null },
      }),
      this.prisma.campaign.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalActions,
      totalCampaigns,
    };
  }

  private mapToResponseDto(project: any): ProjectResponseDto {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      isTemplate: project.isTemplate,
      type: project.type,
      description: project.description,
      problem: project.problem,
      solution: project.solution,
      impact: project.impact,
      metrics: project.metrics,
      timeline: project.timeline,
      resources: project.resources,
      risks: project.risks,
      status: project.status,
      createdAt: project.createdAt,
      createdById: project.createdById,
      organizationId: project.organizationId,
      updatedAt: project.updatedAt,
      deletedAt: project.deletedAt,
      organization: project.organization,
      createdBy: project.createdBy,
      actions: project.actions || [],
      campaigns: project.campaigns || [],
      actionsCount: project._count?.actions || 0,
      campaignsCount: project._count?.campaigns || 0,
    };
  }
}
