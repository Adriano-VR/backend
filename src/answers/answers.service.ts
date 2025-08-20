import { Injectable } from '@nestjs/common';
import { answer } from '@prisma/client';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { AnswerRepository } from '../repositories/answer-repository';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private readonly answerRepository: AnswerRepository) {}

  async create(data: CreateAnswerDto): Promise<answer> {
    console.log(data, `ansy-data-${data.questionId}`);

    return this.answerRepository.create(data);
  }

  async findBySubmittedFormId(submittedFormId: string): Promise<answer[]> {
    return this.answerRepository.findBySubmittedFormId(submittedFormId);
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<answer>> {
    return this.answerRepository.findWithQuery(query);
  }
}
