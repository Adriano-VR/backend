import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { QueryParserService } from 'src/shared/query-parser/query-parser.service';
import { Lesson } from '../../prisma/types';
import { LessonRepository } from '../repositories/lesson-repositorie';
import { CreateLessonDto, UpdateLessonDto } from './dto';

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly queryParserService: QueryParserService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Verifica se existe uma lição com o mesmo slug
    const existingLesson = await this.lessonRepository.findBySlug(
      createLessonDto.slug,
    );
    if (existingLesson) {
      throw new ConflictException('Já existe uma lição com este slug');
    }

    // Remove moduleId do objeto e trata como relação
    const { moduleId, ...lessonDataWithoutModule } = createLessonDto;

    const lessonData = {
      ...lessonDataWithoutModule,
      module: {
        connect: { id: moduleId },
      },
    };

    return this.lessonRepository.create(lessonData);
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepository.findAll();
  }

  async findById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }
    return lesson;
  }

  async findBySlug(slug: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findBySlug(slug);
    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }
    return lesson;
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    return this.lessonRepository.findByModuleId(moduleId);
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    // Se está atualizando o slug, verifica se não existe conflito
    if (updateLessonDto.slug && updateLessonDto.slug !== lesson.slug) {
      const existingLesson = await this.lessonRepository.findBySlug(
        updateLessonDto.slug,
      );
      if (existingLesson) {
        throw new ConflictException('Já existe uma lição com este slug');
      }
    }

    // Remove moduleId do objeto e trata como relação
    const { moduleId, ...updateDataWithoutModule } = updateLessonDto;

    const updateData = {
      ...updateDataWithoutModule,
      ...(moduleId && {
        module: {
          connect: { id: moduleId },
        },
      }),
    };

    return this.lessonRepository.update(id, updateData);
  }

  async remove(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    return this.lessonRepository.delete(id);
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Lesson>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query lessons original:', query);
    console.log('Query lessons parsed:', parsedQuery);

    return this.lessonRepository.findWithQuery(parsedQuery);
  }
}
