import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Module } from 'prisma/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGenericRepository } from '../generic-repository-method';
import { ModuleRepository } from '../module-repositorie';

@Injectable()
export class PrismaModuleRepository
  extends PrismaGenericRepository<Module>
  implements ModuleRepository
{
  protected entityName = 'module';
  protected defaultInclude = {
    course: true,
    lessons: true,
  };
  protected prisma: PrismaService;

  constructor(prisma: PrismaService) {
    super();
    this.prisma = prisma;
  }

  async create(moduleData: Prisma.moduleCreateInput): Promise<Module> {
    const module = await this.prisma.module.create({
      data: moduleData,
      include: this.defaultInclude,
    });

    return module as Module;
  }

  async findAll(): Promise<Module[]> {
    console.log('ModuleRepository.findAll() - Iniciando busca de módulos');

    const modules = await this.prisma.module.findMany({
      where: {
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    console.log(
      `ModuleRepository.findAll() - Encontrados ${modules.length} módulos`,
    );
    return modules as Module[];
  }

  async findById(id: string): Promise<Module | null> {
    const module = await this.prisma.module.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return module as Module;
  }

  async findBySlug(slug: string): Promise<Module | null> {
    const module = await this.prisma.module.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return module as Module;
  }

  async findByCourseId(courseId: string): Promise<Module[]> {
    const modules = await this.prisma.module.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return modules as Module[];
  }

  async update(
    id: string,
    moduleData: Prisma.moduleUpdateInput,
  ): Promise<Module> {
    const module = await this.prisma.module.update({
      where: { id },
      data: moduleData,
      include: this.defaultInclude,
    });

    return module as Module;
  }

  async delete(id: string): Promise<Module> {
    const module = await this.prisma.module.delete({
      where: { id },
      include: this.defaultInclude,
    });

    return module as Module;
  }
}
