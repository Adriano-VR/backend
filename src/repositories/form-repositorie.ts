import { Prisma } from '@prisma/client';
import { Form } from '../../prisma/types';
import { CloneFormDto } from '../forms/dto/clone-form-dto';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class FormRepository extends PrismaGenericRepository<Form> {
  abstract create(user: Prisma.formCreateInput): Promise<Form>;

  abstract update(id: string, user: Prisma.formUpdateInput): Promise<Form>;

  abstract delete(id: string): Promise<Form>;

  abstract reactivate(id: string): Promise<Form>;

  abstract findAll(): Promise<Form[]>;

  abstract findById(id: string): Promise<Form | null>;

  abstract findPublicForms(): Promise<Form[]>;

  abstract cloneForm(cloneFormDto: CloneFormDto): Promise<Form[]>;

  abstract findByTemplateIdAndOrganization(
    templateId: string,
    organizationId: string,
  ): Promise<Form | null>;

  abstract findDeletedByTemplateIdAndOrganization(
    templateId: string,
    organizationId: string,
  ): Promise<Form | null>;
}
