import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { QueryParserService } from 'src/shared/query-parser/query-parser.service';
import { Course } from '../../prisma/types';
import { CourseRepository } from '../repositories/course-repositorie';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly queryParserService: QueryParserService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Verifica se existe um curso com o mesmo slug
    const existingCourse = await this.courseRepository.findBySlug(
      createCourseDto.slug,
    );
    if (existingCourse) {
      throw new ConflictException('Já existe um curso com este slug');
    }

    // Remove trailId do objeto e trata como relação
    const { trailId, ...courseDataWithoutTrail } = createCourseDto;

    const courseData = {
      ...courseDataWithoutTrail,
      ...(trailId && {
        trail: {
          connect: { id: trailId },
        },
      }),
    };

    return this.courseRepository.create(courseData);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.findAll();
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return course;
  }

  async findBySlug(slug: string): Promise<Course> {
    const course = await this.courseRepository.findBySlug(slug);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return course;
  }

  async findByTrailId(trailId: string): Promise<Course[]> {
    return this.courseRepository.findByTrailId(trailId);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    // Se está atualizando o slug, verifica se não existe conflito
    if (updateCourseDto.slug && updateCourseDto.slug !== course.slug) {
      const existingCourse = await this.courseRepository.findBySlug(
        updateCourseDto.slug,
      );
      if (existingCourse) {
        throw new ConflictException('Já existe um curso com este slug');
      }
    }

    // Remove trailId do objeto e trata como relação
    const { trailId, ...updateDataWithoutTrail } = updateCourseDto;

    const updateData = {
      ...updateDataWithoutTrail,
      ...(trailId && {
        trail: {
          connect: { id: trailId },
        },
      }),
    };

    return this.courseRepository.update(id, updateData);
  }

  async remove(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return this.courseRepository.delete(id);
  }

  async findWithModules(id: string): Promise<Course> {
    const course = await this.courseRepository.findWithModules(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return course;
  }

  async findWithModulesAndLessons(id: string): Promise<Course> {
    const course = await this.courseRepository.findWithModulesAndLessons(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return course;
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Course>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query courses original:', query);
    console.log('Query courses parsed:', parsedQuery);

    const res = await this.courseRepository.findWithQuery(parsedQuery);
    console.log('Res courses:', res);
    return res;
  }
}
