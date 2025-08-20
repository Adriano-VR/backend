import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Lesson } from 'prisma/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGenericRepository } from '../generic-repository-method';
import { LessonRepository } from '../lesson-repositorie';

@Injectable()
export class PrismaLessonRepository
  extends PrismaGenericRepository<Lesson>
  implements LessonRepository
{
  protected entityName = 'lesson';
  protected defaultInclude = {
    module: true,
  };
  protected prisma: PrismaService;

  constructor(prisma: PrismaService) {
    super();
    this.prisma = prisma;
  }

  async create(lessonData: Prisma.lessonCreateInput): Promise<Lesson> {
    const lesson = await this.prisma.lesson.create({
      data: lessonData,
      include: this.defaultInclude,
    });

    return lesson as Lesson;
  }

  async findAll(): Promise<Lesson[]> {
    console.log('LessonRepository.findAll() - Iniciando busca de lições');

    const lessons = await this.prisma.lesson.findMany({
      where: {
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    console.log(
      `LessonRepository.findAll() - Encontradas ${lessons.length} lições`,
    );
    return lessons as Lesson[];
  }

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return lesson as Lesson;
  }

  async findBySlug(slug: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return lesson as Lesson;
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        moduleId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return lessons as Lesson[];
  }

  async update(
    id: string,
    lessonData: Prisma.lessonUpdateInput,
  ): Promise<Lesson> {
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: lessonData,
      include: this.defaultInclude,
    });

    return lesson as Lesson;
  }

  async delete(id: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.delete({
      where: { id },
      include: this.defaultInclude,
    });

    return lesson as Lesson;
  }
}
