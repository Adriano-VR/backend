import { Injectable, NotFoundException } from '@nestjs/common';
import { SubmittedForm } from '../../prisma/types';
import { SubmittedFormRepository } from '../repositories/submitted-form-repositorie';
import { CreateSubmittedFormDto } from './dto/create-submitted-form.dto';
import { UpdateSubmittedFormDto } from './dto/update-submitted-form.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubmittedFormsService {
  constructor(
    private readonly submittedFormRepository: SubmittedFormRepository,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {
    console.log(`🔍 [SubmittedFormsService] Constructor - NotificationsService injetado:`, !!this.notificationsService);
  }

  async create(
    createSubmittedFormDto: CreateSubmittedFormDto,
  ): Promise<SubmittedForm> {
    // Se não foi fornecido campaignId, buscar a campanha ativa da organização
    if (!createSubmittedFormDto.campaignId) {
      const activeCampaign = await this.findActiveCampaignForForm(createSubmittedFormDto.formId);
      if (activeCampaign) {
        createSubmittedFormDto.campaignId = activeCampaign.id;
        console.log(`🔗 [SubmittedFormsService] Vinculando submitted form à campanha ativa: ${activeCampaign.name}`);
      } else {
        console.log('⚠️ [SubmittedFormsService] Nenhuma campanha ativa encontrada para vincular o submitted form');
      }
    }

    const submittedForm = await this.submittedFormRepository.create(createSubmittedFormDto);
    
    console.log(`🔍 [SubmittedFormsService] SubmittedForm criado:`, {
      id: submittedForm.id,
      formId: submittedForm.formId,
      status: submittedForm.status,
      profileId: submittedForm.profileId
    });
    
    // Notificar admin da organização sobre nova resposta
    await this.notifyAdminOnFormSubmission(submittedForm);
    
    return submittedForm;
  }

  async findAll(): Promise<SubmittedForm[]> {
    return this.submittedFormRepository.findAll();
  }

  async findOne(id: string): Promise<SubmittedForm> {
    const submittedForm = await this.submittedFormRepository.findById(id);
    if (!submittedForm) {
      throw new NotFoundException(
        `Formulário submetido com ID ${id} não encontrado`,
      );
    }
    return submittedForm;
  }

  async findByFormId(formId: string): Promise<SubmittedForm[]> {
    return this.submittedFormRepository.findByFormId(formId);
  }

  async findByProfileId(profileId: string): Promise<SubmittedForm[]> {
    return this.submittedFormRepository.findByProfileId(profileId);
  }

  async findByStatus(status: string): Promise<SubmittedForm[]> {
    return this.submittedFormRepository.findByStatus(status);
  }

  async update(
    id: string,
    updateSubmittedFormDto: UpdateSubmittedFormDto,
  ): Promise<SubmittedForm> {
    const existingSubmittedForm =
      await this.submittedFormRepository.findById(id);
    if (!existingSubmittedForm) {
      throw new NotFoundException(
        `Formulário submetido com ID ${id} não encontrado`,
      );
    }

    const updatedSubmittedForm = await this.submittedFormRepository.update(id, updateSubmittedFormDto);
    
    console.log(`🔍 [SubmittedFormsService] Verificando notificação:`, {
      newStatus: updateSubmittedFormDto.status,
      oldStatus: existingSubmittedForm.status,
      shouldNotify: updateSubmittedFormDto.status === 'completed' && existingSubmittedForm.status !== 'completed'
    });
    
    // Notificar admin quando status mudar para completed
    if (updateSubmittedFormDto.status === 'completed') {
      console.log(`📢 [SubmittedFormsService] Status mudou para completed, disparando notificação...`);
      await this.notifyAdminOnFormCompletion(updatedSubmittedForm);
    }
    
    return updatedSubmittedForm;
  }

  async remove(id: string): Promise<SubmittedForm> {
    const existingSubmittedForm =
      await this.submittedFormRepository.findById(id);
    if (!existingSubmittedForm) {
      throw new NotFoundException(
        `Formulário submetido com ID ${id} não encontrado`,
      );
    }
    return this.submittedFormRepository.delete(id);
  }

  async findOrganizationSubmittedForms(
    organizationId: string,
  ): Promise<SubmittedForm[]> {
    return this.submittedFormRepository.findOrganizationSubmittedForms(
      organizationId,
    );
  }

  async getUserProgressStats(profileId: string, organizationId: string) {
    // Buscar todos os formulários da organização
    const forms =
      await this.submittedFormRepository.findFormsByOrganization(
        organizationId,
      );

    // Buscar submitted forms do usuário
    const userSubmittedForms =
      await this.submittedFormRepository.findByProfileId(profileId);

    // Calcular estatísticas
    const totalForms = forms.length;
    const completedForms = userSubmittedForms.filter(
      (form) => form.status === 'completed',
    ).length;

    return {
      totalForms,
      completedForms,
      completionRate:
        totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0,
    };
  }

  async linkToCampaign(id: string, campaignId: string): Promise<SubmittedForm> {
    const submittedForm = await this.submittedFormRepository.findById(id);
    if (!submittedForm) {
      throw new NotFoundException(`SubmittedForm com ID ${id} não encontrado`);
    }

    return this.submittedFormRepository.update(id, { 
      campaign: { connect: { id: campaignId } }
    });
  }

  /**
   * Busca a campanha ativa da organização do formulário
   */
  private async findActiveCampaignForForm(formId: string): Promise<{ id: string; name: string } | null> {
    try {
      // Buscar o formulário e sua organização
      const form = await this.prisma.form.findUnique({
        where: { id: formId },
        select: {
          organizationId: true,
        },
      });

      if (!form || !form.organizationId) {
        console.log('⚠️ [SubmittedFormsService] Formulário não encontrado ou sem organização');
        return null;
      }

      // Buscar campanha ativa da organização
      const activeCampaign = await this.prisma.campaign.findFirst({
        where: {
          organizationId: form.organizationId,
          status: 'active',
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return activeCampaign;
    } catch (error) {
      console.error('❌ [SubmittedFormsService] Erro ao buscar campanha ativa:', error);
      return null;
    }
  }

  /**
   * Notifica o admin da organização quando um colaborador submete formulário
   */
  private async notifyAdminOnFormSubmission(submittedForm: SubmittedForm) {
    try {
      // Verificar se formId existe
      if (!submittedForm.formId) {
        console.log('⚠️ [SubmittedFormsService] SubmittedForm sem formId para notificação');
        return;
      }

      // Buscar o formulário para obter a organização
      const form = await this.prisma.form.findUnique({
        where: { id: submittedForm.formId },
        select: {
          id: true,
          title: true,
          organizationId: true,
        },
      });

      if (!form || !form.organizationId) {
        console.log('⚠️ [SubmittedFormsService] Formulário não encontrado ou sem organização para notificação');
        return;
      }

      // Buscar admin da organização
      console.log(`🔍 [SubmittedFormsService] Buscando admin para organização: ${form.organizationId}`);
      
      const admin = await this.prisma.profile.findFirst({
        where: {
          organizationMemberships: {
            some: {
              organizationId: form.organizationId,
              role: 'admin',
              status: 'active',
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      console.log(`🔍 [SubmittedFormsService] Resultado da busca por admin:`, {
        adminFound: !!admin,
        adminId: admin?.id,
        adminName: admin?.name
      });

      if (admin) {
        await this.notificationsService.createNotification({
          profileId: admin.id,
          title: 'Nova resposta de formulário',
          message: `Um colaborador respondeu ao formulário "${form.title}".`,
        });
        console.log(`✅ [SubmittedFormsService] Notificação enviada para admin ${admin.name}`);
      } else {
        console.log('⚠️ [SubmittedFormsService] Nenhum admin encontrado para notificar');
        
        // Debug: verificar se existem membros da organização
        const orgMembers = await this.prisma.organizationMember.findMany({
          where: {
            organizationId: form.organizationId,
          },
          select: {
            role: true,
            status: true,
            profile: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        });
        
        console.log(`🔍 [SubmittedFormsService] Membros da organização ${form.organizationId}:`, orgMembers);
      }
    } catch (error) {
      console.error('❌ [SubmittedFormsService] Erro ao notificar admin:', error);
    }
  }

  /**
   * Notifica o admin da organização quando um formulário é completado
   */
  private async notifyAdminOnFormCompletion(submittedForm: SubmittedForm) {
    try {
      console.log(`🔍 [SubmittedFormsService] Iniciando notificação de completude:`, {
        submittedFormId: submittedForm.id,
        formId: submittedForm.formId,
        status: submittedForm.status
      });
      
      // Verificar se formId existe
      if (!submittedForm.formId) {
        console.log('⚠️ [SubmittedFormsService] SubmittedForm sem formId para notificação de completude');
        return;
      }

      // Buscar o formulário para obter a organização
      const form = await this.prisma.form.findUnique({
        where: { id: submittedForm.formId },
        select: {
          id: true,
          title: true,
          organizationId: true,
        },
      });

      if (!form || !form.organizationId) {
        console.log('⚠️ [SubmittedFormsService] Formulário não encontrado ou sem organização para notificação de completude');
        return;
      }

      // Buscar admin da organização
      console.log(`🔍 [SubmittedFormsService] Buscando admin para organização: ${form.organizationId}`);
      
      const admin = await this.prisma.profile.findFirst({
        where: {
          organizationMemberships: {
            some: {
              organizationId: form.organizationId,
              role: 'admin',
              status: 'active',
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      console.log(`🔍 [SubmittedFormsService] Resultado da busca por admin:`, {
        adminFound: !!admin,
        adminId: admin?.id,
        adminName: admin?.name
      });

      if (admin) {
        await this.notificationsService.createNotification({
          profileId: admin.id,
          title: 'Formulário completado',
          message: `Um colaborador completou o formulário "${form.title}".`,
        });
        console.log(`✅ [SubmittedFormsService] Notificação de completude enviada para admin ${admin.name}`);
      } else {
        console.log('⚠️ [SubmittedFormsService] Nenhum admin encontrado para notificar sobre completude');
        
        // Debug: verificar se existem membros da organização
        const orgMembers = await this.prisma.organizationMember.findMany({
          where: {
            organizationId: form.organizationId,
          },
          select: {
            role: true,
            status: true,
            profile: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        });
        
        console.log(`🔍 [SubmittedFormsService] Membros da organização ${form.organizationId}:`, orgMembers);
      }
    } catch (error) {
      console.error('❌ [SubmittedFormsService] Erro ao notificar admin sobre completude:', error);
    }
  }
}
