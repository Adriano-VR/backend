import { answer } from '@prisma/client';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class AnswerRepository extends PrismaGenericRepository<answer> {
  abstract create(data: CreateAnswerDto): Promise<answer>;
  abstract update(id: string, data: any): Promise<answer>;
  abstract delete(id: string): Promise<answer>;
  abstract findAll(): Promise<answer[]>;
  abstract findById(id: string): Promise<answer | null>;
  abstract findBySubmittedFormId(submittedFormId: string): Promise<answer[]>;
}
