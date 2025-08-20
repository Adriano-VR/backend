import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { QueryParserService } from 'src/shared/query-parser/query-parser.service';
import { Module } from '../../prisma/types';
import { ModuleRepository } from '../repositories/module-repositorie';
import { CreateModuleDto, UpdateModuleDto } from './dto';

@Injectable()
export class ModulesService {
  constructor(
    private readonly moduleRepository: ModuleRepository,
    private readonly queryParserService: QueryParserService,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    // Verifica se existe um módulo com o mesmo slug
    const existingModule = await this.moduleRepository.findBySlug(
      createModuleDto.slug,
    );
    if (existingModule) {
      throw new ConflictException('Já existe um módulo com este slug');
    }

    // Remove courseId do objeto e trata como relação
    const { courseId, ...moduleDataWithoutCourse } = createModuleDto;

    const moduleData = {
      ...moduleDataWithoutCourse,
      course: {
        connect: { id: courseId },
      },
    };

    return this.moduleRepository.create(moduleData);
  }

  async findAll(): Promise<Module[]> {
    return this.moduleRepository.findAll();
  }

  async findById(id: string): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }
    return module;
  }

  async findBySlug(slug: string): Promise<Module> {
    const module = await this.moduleRepository.findBySlug(slug);
    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }
    return module;
  }

  async findByCourseId(courseId: string): Promise<Module[]> {
    return this.moduleRepository.findByCourseId(courseId);
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    // Se está atualizando o slug, verifica se não existe conflito
    if (updateModuleDto.slug && updateModuleDto.slug !== module.slug) {
      const existingModule = await this.moduleRepository.findBySlug(
        updateModuleDto.slug,
      );
      if (existingModule) {
        throw new ConflictException('Já existe um módulo com este slug');
      }
    }

    // Remove courseId do objeto e trata como relação
    const { courseId, ...updateDataWithoutCourse } = updateModuleDto;

    const updateData = {
      ...updateDataWithoutCourse,
      ...(courseId && {
        course: {
          connect: { id: courseId },
        },
      }),
    };

    return this.moduleRepository.update(id, updateData);
  }

  async remove(id: string): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    return this.moduleRepository.delete(id);
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Module>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query modules original:', query);
    console.log('Query modules parsed:', parsedQuery);

    return this.moduleRepository.findWithQuery(parsedQuery);
  }
}
