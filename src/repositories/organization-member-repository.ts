import { Prisma } from '@prisma/client';
import { OrganizationMember } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class OrganizationMemberRepository extends PrismaGenericRepository<OrganizationMember> {
  abstract create(
    user: Prisma.organizationMemberCreateInput,
  ): Promise<OrganizationMember>;

  abstract update(
    id: string,
    user: Prisma.organizationMemberUpdateInput,
  ): Promise<OrganizationMember>;

  abstract delete(id: string): Promise<OrganizationMember>;

  abstract findAll(): Promise<OrganizationMember[]>;

  abstract findById(id: string): Promise<OrganizationMember | null>;

  abstract findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMember[]>;
}
