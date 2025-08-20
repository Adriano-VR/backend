import { Prisma } from '@prisma/client';
import { Course } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class CourseRepository extends PrismaGenericRepository<Course> {
  abstract create(course: Prisma.courseCreateInput): Promise<Course>;

  abstract update(
    id: string,
    course: Prisma.courseUpdateInput,
  ): Promise<Course>;

  abstract delete(id: string): Promise<Course>;

  abstract findAll(): Promise<Course[]>;

  abstract findById(id: string): Promise<Course | null>;

  abstract findBySlug(slug: string): Promise<Course | null>;

  abstract findByTrailId(trailId: string): Promise<Course[]>;

  abstract findWithModules(id: string): Promise<Course | null>;

  abstract findWithModulesAndLessons(id: string): Promise<Course | null>;
}
