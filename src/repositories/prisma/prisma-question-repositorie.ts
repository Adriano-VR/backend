import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Question } from '../../../prisma/types';
import { PrismaGenericRepository } from '../generic-repository-method';
import { QuestionRepository } from '../question-repositorie';

@Injectable()
export class PrismaQuestionRepository
  extends PrismaGenericRepository<Question>
  implements QuestionRepository
{
  protected entityName = 'question';
  protected defaultInclude = {
    formQuestion: true,
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(question: Prisma.questionCreateInput): Promise<Question> {
    const result = await this.prisma.question.create({
      data: question,
      include: this.defaultInclude,
    });

    return result as Question;
  }

  async update(
    id: string,
    question: Prisma.questionUpdateInput,
  ): Promise<Question> {
    const result = await this.prisma.question.update({
      where: { id },
      data: question,
      include: this.defaultInclude,
    });

    return result as Question;
  }

  async delete(id: string): Promise<Question> {
    const result = await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });

    return result as Question;
  }

  async findAll(): Promise<Question[]> {
    const result = await this.prisma.question.findMany({
      where: { deletedAt: null },
      include: this.defaultInclude,
    });

    return result as Question[];
  }

  async findById(id: string): Promise<Question | null> {
    const result = await this.prisma.question.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    return result as Question;
  }

  async findByFormId(formId: string): Promise<Question[]> {
    const result = await this.prisma.question.findMany({
      where: {
        formQuestion: { some: { formId } },
        deletedAt: null,
      },
      include: this.defaultInclude,
      orderBy: { createdAt: 'asc' },
    });

    return result as Question[];
  }
}
