import { Prisma } from '@prisma/client';
import { Organization } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class OrganizationRepository extends PrismaGenericRepository<Organization> {
  abstract create(
    organization: Prisma.organizationCreateInput,
  ): Promise<Organization>;

  abstract update(
    id: string,
    organization: Prisma.organizationUpdateInput,
  ): Promise<Organization>;

  abstract delete(id: string): Promise<Organization>;

  abstract findAll(): Promise<Organization[]>;

  abstract findById(id: string): Promise<Organization | null>;

  abstract findByUserId(userId: string): Promise<Organization[]>;

  abstract findBySlug(slug: string): Promise<Organization | null>;

  abstract findByRegistrationCode(
    registrationCode: string,
  ): Promise<Organization | null>;

  abstract findByCnpj(
    cnpj: string,
  ): Promise<Organization | null>;

  abstract findByCreatedById(createdById: string): Promise<Organization[]>;

  abstract findActiveOrganizations(): Promise<Organization[]>;

  abstract findByInviteCode(inviteCode: string): Promise<Organization | null>;

  abstract associateProfileToOrg(
    profileId: string,
    orgId: string,
  ): Promise<Organization>;

  abstract findByName(name: string): Promise<Organization | null>;

  abstract findByNameAndCreatedBy(
    name: string,
    createdById: string,
  ): Promise<Organization | null>;
}
