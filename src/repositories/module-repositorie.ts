import { Prisma } from '@prisma/client';
import { Module } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class ModuleRepository extends PrismaGenericRepository<Module> {
  abstract create(module: Prisma.moduleCreateInput): Promise<Module>;

  abstract update(
    id: string,
    module: Prisma.moduleUpdateInput,
  ): Promise<Module>;

  abstract delete(id: string): Promise<Module>;

  abstract findAll(): Promise<Module[]>;

  abstract findById(id: string): Promise<Module | null>;

  abstract findBySlug(slug: string): Promise<Module | null>;

  abstract findByCourseId(courseId: string): Promise<Module[]>;
}
