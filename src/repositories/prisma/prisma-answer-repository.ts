import { Injectable } from '@nestjs/common';
import { answer } from '@prisma/client';
import { CreateAnswerDto } from 'src/answers/dto/create-answer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnswerRepository } from '../answer-repository';
import { PrismaGenericRepository } from '../generic-repository-method';

@Injectable()
export class PrismaAnswerRepository
  extends PrismaGenericRepository<answer>
  implements AnswerRepository
{
  protected entityName = 'answer';
  protected defaultInclude = {
    submittedForm: true,
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(data: CreateAnswerDto): Promise<answer> {
    // First try to find an existing answer for this question and submitted form
    const existingAnswer = await this.prisma.answer.findUnique({
      where: {
        submittedFormId_questionId: {
          submittedFormId: data.submittedFormId,
          questionId: data.questionId,
        },
      },
    });

    if (existingAnswer) {
      // Update existing answer
      const result = await this.prisma.answer.update({
        where: { id: existingAnswer.id },
        data: {
          value: String(data.answer),
          updatedAt: new Date(),
        },
        include: this.defaultInclude,
      });
      return result as answer;
    } else {
      // Create new answer
      const result = await this.prisma.answer.create({
        data: {
          questionId: data.questionId,
          submittedFormId: data.submittedFormId,
          value: String(data.answer),
        },
        include: this.defaultInclude,
      });
      return result as answer;
    }
  }

  async update(id: string, data: any): Promise<answer> {
    const result = await this.prisma.answer.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });

    return result as answer;
  }

  async delete(id: string): Promise<answer> {
    const result = await this.prisma.answer.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });

    return result as answer;
  }

  async findAll(): Promise<answer[]> {
    const result = await this.prisma.answer.findMany({
      where: { deletedAt: null },
      include: this.defaultInclude,
    });

    return result as answer[];
  }

  async findById(id: string): Promise<answer | null> {
    const result = await this.prisma.answer.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    return result as answer;
  }

  async findBySubmittedFormId(submittedFormId: string): Promise<answer[]> {
    const result = await this.prisma.answer.findMany({
      where: {
        submittedFormId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return result as answer[];
  }
}
