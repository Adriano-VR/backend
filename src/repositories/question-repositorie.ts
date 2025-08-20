import { Prisma } from '@prisma/client';
import { Question } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class QuestionRepository extends PrismaGenericRepository<Question> {
  abstract create(question: Prisma.questionCreateInput): Promise<Question>;

  abstract update(
    id: string,
    question: Prisma.questionUpdateInput,
  ): Promise<Question>;

  abstract delete(id: string): Promise<Question>;

  abstract findAll(): Promise<Question[]>;

  abstract findById(id: string): Promise<Question | null>;

  abstract findByFormId(formId: string): Promise<Question[]>;
}
