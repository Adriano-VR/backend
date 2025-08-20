import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from '../../prisma/types';
import { QuestionRepository } from '../repositories/question-repositorie';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    return this.questionRepository.create(createQuestionDto);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.findAll();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Pergunta com ID ${id} não encontrada`);
    }
    return question;
  }

  async findByFormId(formId: string): Promise<Question[]> {
    return this.questionRepository.findByFormId(formId);
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const existingQuestion = await this.questionRepository.findById(id);
    if (!existingQuestion) {
      throw new NotFoundException(`Pergunta com ID ${id} não encontrada`);
    }
    return this.questionRepository.update(id, updateQuestionDto);
  }

  async remove(id: string): Promise<Question> {
    const existingQuestion = await this.questionRepository.findById(id);
    if (!existingQuestion) {
      throw new NotFoundException(`Pergunta com ID ${id} não encontrada`);
    }
    return this.questionRepository.delete(id);
  }
}
