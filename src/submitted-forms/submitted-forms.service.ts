import { Injectable, NotFoundException } from '@nestjs/common';
import { SubmittedForm } from '../../prisma/types';
import { SubmittedFormRepository } from '../repositories/submitted-form-repositorie';
import { CreateSubmittedFormDto } from './dto/create-submitted-form.dto';
import { UpdateSubmittedFormDto } from './dto/update-submitted-form.dto';

@Injectable()
export class SubmittedFormsService {
  constructor(
    private readonly submittedFormRepository: SubmittedFormRepository,
  ) {}

  async create(
    createSubmittedFormDto: CreateSubmittedFormDto,
  ): Promise<SubmittedForm> {
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
}
