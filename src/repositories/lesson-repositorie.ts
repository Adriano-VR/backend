import { Prisma } from '@prisma/client';
import { Lesson } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class LessonRepository extends PrismaGenericRepository<Lesson> {
  abstract create(lesson: Prisma.lessonCreateInput): Promise<Lesson>;

  abstract update(
    id: string,
    lesson: Prisma.lessonUpdateInput,
  ): Promise<Lesson>;

  abstract delete(id: string): Promise<Lesson>;

  abstract findAll(): Promise<Lesson[]>;

  abstract findById(id: string): Promise<Lesson | null>;

  abstract findBySlug(slug: string): Promise<Lesson | null>;

  abstract findByModuleId(moduleId: string): Promise<Lesson[]>;
}
