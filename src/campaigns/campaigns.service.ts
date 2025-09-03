import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { ChecklistProjectService } from '../services/checklist-project.service';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checklistProjectService: ChecklistProjectService
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string): Promise<CampaignResponseDto> {
    const campaign = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        startDate: new Date(createCampaignDto.startDate),
        endDate: createCampaignDto.endDate ? new Date(createCampaignDto.endDate) : null,
        createdById: userId,
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
            submittedForms: true,
            projects: true,
            documents: true,
          },
        },
      },
    });

    return this.mapToResponseDto(campaign);
  }

  async findAll(organizationId?: string): Promise<CampaignResponseDto[]> {
    const campaigns = await this.prisma.campaign.findMany({
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
            submittedForms: true,
            projects: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return campaigns.map(campaign => this.mapToResponseDto(campaign));
  }

  async findOne(id: string): Promise<CampaignResponseDto> {
    const campaign = await this.prisma.campaign.findFirst({
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
            submittedForms: true,
            projects: true,
            documents: true,
          },
        },
        projects: {
          where: {
            deletedAt: null,
          },
          include: {
            _count: {
              select: {
                actions: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        submittedForms: {
          where: {
            deletedAt: null,
          },
          include: {
            _count: {
              select: {
                answers: true,
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
        },
        documents: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    return this.mapToResponseDto(campaign);
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<CampaignResponseDto> {
    const existingCampaign = await this.prisma.campaign.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCampaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    const updateData: any = { ...updateCampaignDto };
    
    if (updateCampaignDto.startDate) {
      updateData.startDate = new Date(updateCampaignDto.startDate);
    }
    
    if (updateCampaignDto.endDate) {
      updateData.endDate = new Date(updateCampaignDto.endDate);
    }

    const campaign = await this.prisma.campaign.update({
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
            submittedForms: true,
            projects: true,
            documents: true,
          },
        },
      },
    });

    // Se a campanha foi ativada, criar automaticamente o projeto de checklist
    if (updateCampaignDto.status === 'active' && existingCampaign.status !== 'active') {
      try {
        console.log('🚀 [CampaignsService] Campanha ativada, criando projeto de checklist automaticamente...');
        if (campaign.organizationId) {
          await this.checklistProjectService.createChecklistProject(campaign.id, campaign.organizationId);
          console.log('✅ [CampaignsService] Projeto de checklist criado com sucesso!');
        } else {
          console.log('⚠️ [CampaignsService] Campanha não possui organização associada, não é possível criar projeto de checklist');
        }
      } catch (error) {
        console.error('❌ [CampaignsService] Erro ao criar projeto de checklist:', error);
        // Não falhar a atualização da campanha se houver erro na criação do projeto
      }
    }

    return this.mapToResponseDto(campaign);
  }

  async remove(id: string): Promise<void> {
    const existingCampaign = await this.prisma.campaign.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCampaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    await this.prisma.campaign.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getCampaignStats(id: string): Promise<any> {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            submittedForms: true,
            projects: true,
            documents: true,
          },
        },
        submittedForms: {
          where: {
            deletedAt: null,
          },
          include: {
            _count: {
              select: {
                answers: true,
              },
            },
          },
        },
        projects: {
          where: {
            deletedAt: null,
          },
          include: {
            _count: {
              select: {
                actions: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    return {
      id: campaign.id,
      name: campaign.name,
      totalSubmittedForms: campaign._count.submittedForms,
      totalProjects: campaign._count.projects,
      totalDocuments: campaign._count.documents,
      submittedForms: campaign.submittedForms.map(form => ({
        id: form.id,
        status: form.status,
        startedAt: form.startedAt,
        completedAt: form.completedAt,
        answersCount: form._count.answers,
      })),
      projects: campaign.projects.map(project => ({
        id: project.id,
        title: project.title,
        status: project.status,
        type: project.type,
        actionsCount: project._count.actions,
      })),
    };
  }

    private mapToResponseDto(campaign: any): CampaignResponseDto {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      frequency: campaign.frequency,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      organizationId: campaign.organizationId,
      createdById: campaign.createdById,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      deletedAt: campaign.deletedAt,
      organization: campaign.organization,
      createdBy: campaign.createdBy,
      submittedFormsCount: campaign._count?.submittedForms || 0,
      projectsCount: campaign._count?.projects || 0,
      documentsCount: campaign._count?.documents || 0,
      projects: campaign.projects?.map((project: any) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        type: project.type,
        status: project.status,
        description: project.description,
        actionsCount: project._count?.actions || 0,
      })),
      submittedForms: campaign.submittedForms?.map((form: any) => ({
        id: form.id,
        status: form.status,
        startedAt: form.startedAt,
        completedAt: form.completedAt,
        answersCount: form._count?.answers || 0,
      })),
      documents: campaign.documents?.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
      })),
    };                                                                                                                                                                                                                                                                                                          
  }

  async getFormApplicationFrequency(formId: string): Promise<any> {
    // Buscar o formulário e verificar se há submittedForms vinculados a campanhas
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        organization: {
          select: {
            id: true,
            settings: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Formulário com ID ${formId} não encontrado`);
    }

    // Buscar submittedForms deste formulário que tenham campanha
    const submittedFormWithCampaign = await this.prisma.submittedForm.findFirst({
      where: { 
        formId: formId,
        campaignId: { not: null }
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            frequency: true,
          },
        },
      },
    });

    // Se há um submittedForm com campanha, usar a frequência da campanha
    if (submittedFormWithCampaign?.campaign) {
      return {
        formId,
        campaignId: submittedFormWithCampaign.campaign.id,
        campaignName: submittedFormWithCampaign.campaign.name,
        frequency: submittedFormWithCampaign.campaign.frequency,
        source: 'campaign',
      };
    }

    // Se não tem campanha, usar a frequência padrão da organização
    const organizationSettings = form.organization?.settings as any;
    const organizationFrequency = organizationSettings?.formApplicationFrequency || 'semestral';
    
    return {
      formId,
      campaignId: null,
      campaignName: null,
      frequency: organizationFrequency,
      source: 'organization_default',
    };
  }
}


