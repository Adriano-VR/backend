import { Prisma } from '@prisma/client';
import { SubmittedForm } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class SubmittedFormRepository extends PrismaGenericRepository<SubmittedForm> {
  abstract create(
    submittedForm: Prisma.submittedFormCreateInput,
  ): Promise<SubmittedForm>;

  abstract update(
    id: string,
    submittedForm: Prisma.submittedFormUpdateInput,
  ): Promise<SubmittedForm>;

  abstract delete(id: string): Promise<SubmittedForm>;

  abstract findAll(): Promise<SubmittedForm[]>;

  abstract findById(id: string): Promise<SubmittedForm | null>;

  abstract findByFormId(formId: string): Promise<SubmittedForm[]>;

  abstract findByProfileId(profileId: string): Promise<SubmittedForm[]>;

  abstract findByStatus(status: string): Promise<SubmittedForm[]>;

  abstract findOrganizationSubmittedForms(
    organizationId: string,
  ): Promise<SubmittedForm[]>;

  abstract findFormsByOrganization(organizationId: string): Promise<any[]>;
}
