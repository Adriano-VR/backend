import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmittedForm } from '../../../prisma/types';
import { PrismaGenericRepository } from '../generic-repository-method';
import { SubmittedFormRepository } from '../submitted-form-repositorie';

@Injectable()
export class PrismaSubmittedFormRepository
  extends PrismaGenericRepository<SubmittedForm>
  implements SubmittedFormRepository
{
  protected entityName = 'submittedForm';
  protected defaultInclude = {
    form: true,
    profile: true,
    answers: true,
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(
    submittedForm: Prisma.submittedFormCreateInput,
  ): Promise<SubmittedForm> {
    const result = await this.prisma.submittedForm.create({
      data: submittedForm,
      include: this.defaultInclude,
    });

    return result as SubmittedForm;
  }

  async update(
    id: string,
    submittedForm: Prisma.submittedFormUpdateInput,
  ): Promise<SubmittedForm> {
    const result = await this.prisma.submittedForm.update({
      where: { id },
      data: submittedForm,
      include: this.defaultInclude,
    });

    return result as SubmittedForm;
  }

  async delete(id: string): Promise<SubmittedForm> {
    const result = await this.prisma.submittedForm.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });

    return result as SubmittedForm;
  }

  async findAll(): Promise<SubmittedForm[]> {
    const result = await this.prisma.submittedForm.findMany({
      where: { deletedAt: null },
      include: this.defaultInclude,
    });

    return result as SubmittedForm[];
  }

  async findById(id: string): Promise<SubmittedForm | null> {
    const result = await this.prisma.submittedForm.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    return result as SubmittedForm;
  }

  async findByFormId(formId: string): Promise<SubmittedForm[]> {
    const result = await this.prisma.submittedForm.findMany({
      where: {
        formId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return result as SubmittedForm[];
  }

  async findByProfileId(profileId: string): Promise<SubmittedForm[]> {
    const result = await this.prisma.submittedForm.findMany({
      where: {
        profileId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return result as SubmittedForm[];
  }

  async findByStatus(status: string): Promise<SubmittedForm[]> {
    const result = await this.prisma.submittedForm.findMany({
      where: {
        status: status as any,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return result as SubmittedForm[];
  }

  async findOrganizationSubmittedForms(
    organizationId: string,
  ): Promise<SubmittedForm[]> {
    const result = await this.prisma.submittedForm.findMany({
      where: {
        form: {
          organizationId,
        },
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return result as SubmittedForm[];
  }

  async findFormsByOrganization(organizationId: string): Promise<any[]> {
    const result = await this.prisma.form.findMany({
      where: {
        organizationId,
        deletedAt: null,
        isTemplate: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    return result;
  }
}
