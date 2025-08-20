import { Prisma } from '@prisma/client';
import { Trail } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class TrailRepository extends PrismaGenericRepository<Trail> {
  abstract create(trail: Prisma.trailCreateInput): Promise<Trail>;

  abstract update(id: string, trail: Prisma.trailUpdateInput): Promise<Trail>;

  abstract delete(id: string): Promise<Trail>;

  abstract findAll(): Promise<Trail[]>;

  abstract findById(id: string): Promise<Trail | null>;

  abstract findBySlug(slug: string): Promise<Trail | null>;
}
