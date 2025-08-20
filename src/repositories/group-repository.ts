import { Prisma } from '@prisma/client';
import { Group } from 'prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class GroupRepository extends PrismaGenericRepository<Group> {
  abstract create(group: Prisma.groupCreateInput): Promise<Group>;
  abstract update(id: string, group: Prisma.groupUpdateInput): Promise<Group>;
  abstract delete(id: string): Promise<Group>;
  abstract findAll(): Promise<Group[]>;
  abstract findById(id: string): Promise<Group | null>;
  abstract findBySlug(slug: string): Promise<Group | null>;
  abstract findByName(
    name: string,
    organizationId?: string,
  ): Promise<Group | null>;
}
