import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { ChecklistProjectService } from '../services/checklist-project.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RoleBasedNotificationsService } from '../notifications/role-based-notifications.service';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checklistProjectService: ChecklistProjectService,
    private readonly notificationsService: NotificationsService,
    private readonly roleBasedNotifications: RoleBasedNotificationsService
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string): Promise<CampaignResponseDto> {
    // Verificar se está tentando criar uma campanha ativa
    if (createCampaignDto.status === 'active' && createCampaignDto.organizationId) {
      const activeCampaign = await this.prisma.campaign.findFirst({
        where: {
          organizationId: createCampaignDto.organizationId,
          status: 'active',
          deletedAt: null,
        },
      });

      if (activeCampaign) {
        throw new BadRequestException(
          `Não é possível criar uma campanha ativa. A organização já possui uma campanha ativa: "${activeCampaign.name}". Finalize ou pause a campanha ativa antes de criar uma nova.`
        );
      }
    }

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

    // Notificar apenas colaboradores sobre a nova campanha
    if (campaign.organizationId) {
      await this.roleBasedNotifications.notifyCollaborators(
        campaign.organizationId,
        'Nova campanha disponível',
        `Uma nova campanha "${campaign.name}" foi criada e está disponível para você participar.`
      );
    }

    return this.mapToResponseDto(campaign);
  }

  /**
   * Notifica todos os colaboradores da organização sobre uma nova campanha
   */
  private async notifyCollaboratorsAboutNewCampaign(campaign: any) {
    try {
      console.log(`🔔 [CampaignsService] Notificando colaboradores sobre nova campanha: ${campaign.name}`);
      console.log(`🏢 [CampaignsService] OrganizationId: ${campaign.organizationId}`);
      
      // Buscar todos os colaboradores da organização
      const collaborators = await this.prisma.organizationMember.findMany({
        where: {
          organizationId: campaign.organizationId,
          role: 'collaborator',
          status: {
            in: ['active', 'pending']
          },
        },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      console.log(`🔍 [CampaignsService] Encontrados ${collaborators.length} colaboradores para notificar`);
      
      // Debug: verificar se há colaboradores na organização
      const allMembers = await this.prisma.organizationMember.findMany({
        where: {
          organizationId: campaign.organizationId,
        },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
      
      console.log(`🔍 [CampaignsService] Todos os membros da organização:`, allMembers.map(m => ({ 
        id: m.profileId, 
        role: m.role, 
        status: m.status,
        name: m.profile?.name || 'Nome não encontrado'
      })));
      
      if (collaborators.length === 0) {
        console.log(`ℹ️ [CampaignsService] Nenhum colaborador encontrado na organização. Campanha ficará disponível quando colaboradores se cadastrarem.`);
        return;
      }

      console.log(`👥 [CampaignsService] Colaboradores:`, collaborators.map(c => ({ 
        id: c.profileId, 
        name: c.profile?.name || 'Nome não encontrado', 
        email: c.profile?.email || 'Email não encontrado' 
      })));

      // Criar notificação para cada colaborador
      for (const collaborator of collaborators) {
        await this.notificationsService.createNotification({
          profileId: collaborator.profileId,
          title: 'Nova campanha disponível',
          message: `Uma nova campanha "${campaign.name}" foi criada e está disponível para você participar.`,
        });
        
        console.log(`✅ [CampaignsService] Notificação enviada para colaborador ${collaborator.profile?.name || 'Nome não encontrado'}`);
      }

      console.log(`🎉 [CampaignsService] Todas as notificações de campanha foram enviadas com sucesso`);
    } catch (error) {
      console.error('❌ [CampaignsService] Erro ao notificar colaboradores sobre campanha:', error);
    }
  }

  /**
   * Notifica todos os colaboradores da organização sobre uma campanha iniciada
   */
  private async notifyCollaboratorsAboutCampaignStarted(campaign: any) {
    try {
      console.log(`🔔 [CampaignsService] Notificando colaboradores sobre campanha iniciada: ${campaign.name}`);
      console.log(`🏢 [CampaignsService] OrganizationId: ${campaign.organizationId}`);
      
      // Buscar todos os colaboradores da organização
      const collaborators = await this.prisma.organizationMember.findMany({
        where: {
          organizationId: campaign.organizationId,
          role: 'collaborator',
          status: {
            in: ['active', 'pending']
          },
        },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      console.log(`🔍 [CampaignsService] Encontrados ${collaborators.length} colaboradores para notificar sobre campanha iniciada`);
      
      if (collaborators.length === 0) {
        console.log(`ℹ️ [CampaignsService] Nenhum colaborador encontrado na organização. Campanha iniciada ficará disponível quando colaboradores se cadastrarem.`);
        return;
      }

      console.log(`👥 [CampaignsService] Colaboradores:`, collaborators.map(c => ({ 
        id: c.profileId, 
        name: c.profile?.name || 'Nome não encontrado', 
        email: c.profile?.email || 'Email não encontrado' 
      })));

      // Criar notificação para cada colaborador
      for (const collaborator of collaborators) {
        await this.notificationsService.createNotification({
          profileId: collaborator.profileId,
          title: 'Campanha iniciada',
          message: `A campanha "${campaign.name}" foi iniciada e está ativa. Você pode participar agora!`,
        });
        
        console.log(`✅ [CampaignsService] Notificação de campanha iniciada enviada para colaborador ${collaborator.profile?.name || 'Nome não encontrado'}`);
      }

      console.log(`🎉 [CampaignsService] Todas as notificações de campanha iniciada foram enviadas com sucesso`);
    } catch (error) {
      console.error('❌ [CampaignsService] Erro ao notificar colaboradores sobre campanha iniciada:', error);
    }
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
            profile: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

  async update(id: string, updateCampaignDto: UpdateCampaignDto, createdById?: string): Promise<CampaignResponseDto> {
    console.log('🔍 [CampaignsService] createdById recebido:', createdById);
    const existingCampaign = await this.prisma.campaign.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCampaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    // Verificar se está tentando ativar uma campanha
    if (updateCampaignDto.status === 'active' && existingCampaign.status !== 'active') {
      // Verificar se já existe uma campanha ativa na mesma organização
      if (existingCampaign.organizationId) {
        const activeCampaign = await this.prisma.campaign.findFirst({
          where: {
            organizationId: existingCampaign.organizationId,
            status: 'active',
            deletedAt: null,
            id: { not: id }, // Excluir a campanha atual da verificação
          },
        });

        if (activeCampaign) {
          throw new BadRequestException(
            `Não é possível ativar esta campanha. A organização já possui uma campanha ativa: "${activeCampaign.name}". Finalize ou pause a campanha ativa antes de iniciar uma nova.`
          );
        }
      }
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

    // Se a campanha foi ativada, criar automaticamente o projeto de checklist e notificar colaboradores
    if (updateCampaignDto.status === 'active' && existingCampaign.status !== 'active') {
      try {
        console.log('🚀 [CampaignsService] Campanha ativada, criando projeto de checklist automaticamente...');
        if (campaign.organizationId) {
          await this.checklistProjectService.createChecklistProject(campaign.id, campaign.organizationId, createdById);
          console.log('✅ [CampaignsService] Projeto de checklist criado com sucesso!');
          
          // Notificar apenas colaboradores sobre a campanha iniciada
          await this.roleBasedNotifications.notifyCollaborators(
            campaign.organizationId,
            'Campanha iniciada',
            `A campanha "${campaign.name}" foi iniciada e está ativa. Você pode participar agora!`
          );
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
            profile: true,
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
        profile: form.profile ? {
          id: form.profile.id,
          name: form.profile.name,
          email: form.profile.email,
        } : null,
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


