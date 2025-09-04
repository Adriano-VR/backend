import { Injectable, NotFoundException } from '@nestjs/common';
import { SubmittedForm } from '../../prisma/types';
import { SubmittedFormRepository } from '../repositories/submitted-form-repositorie';
import { CreateSubmittedFormDto } from './dto/create-submitted-form.dto';
import { UpdateSubmittedFormDto } from './dto/update-submitted-form.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubmittedFormsService {
  constructor(
    private readonly submittedFormRepository: SubmittedFormRepository,
    private readonly prisma: PrismaService,
  ) {}

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

    return this.submittedFormRepository.create(createSubmittedFormDto);
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
    return this.submittedFormRepository.update(id, updateSubmittedFormDto);
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
}
