import { Prisma } from '@prisma/client';
import { Profile } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class ProfileRepository extends PrismaGenericRepository<Profile> {
  abstract create(profile: Prisma.profileCreateInput): Promise<Profile>;

  abstract update(
    id: string,
    profile: Prisma.profileUpdateInput,
  ): Promise<Profile>;

  abstract delete(id: string): Promise<Profile>;

  abstract findAll(): Promise<Profile[]>;

  abstract findById(id: string): Promise<Profile | null>;

  abstract findByEmail(email: string): Promise<Profile | null>;

  abstract findBySlug(slug: string): Promise<Profile | null>;

  abstract findByCpf(cpf: string): Promise<Profile | null>;

  abstract findByDepartmentId(departmentId: string): Promise<Profile[]>;

  abstract findByRole(role: string): Promise<Profile[]>;

  abstract findActiveProfiles(): Promise<Profile[]>;

  abstract alredyEmailExists(email: string): Promise<boolean>;

  abstract findByName(
    name: string,
    organizationId?: string,
  ): Promise<Profile | null>;

  abstract findAllByMyOrganization(userId: string): Promise<Profile[]>;
}
