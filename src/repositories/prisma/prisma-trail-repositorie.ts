import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Trail } from 'prisma/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGenericRepository } from '../generic-repository-method';
import { TrailRepository } from '../trail-repositorie';

@Injectable()
export class PrismaTrailRepository
  extends PrismaGenericRepository<Trail>
  implements TrailRepository
{
  protected entityName = 'trail';
  protected defaultInclude = {
    courses: true,
  };
  protected prisma: PrismaService;

  constructor(prisma: PrismaService) {
    super();
    this.prisma = prisma;
  }

  async create(trailData: Prisma.trailCreateInput): Promise<Trail> {
    const trail = await this.prisma.trail.create({
      data: trailData,
      include: this.defaultInclude,
    });

    return trail as Trail;
  }

  async findAll(): Promise<Trail[]> {
    console.log('TrailRepository.findAll() - Iniciando busca de trilhas');

    const trails = await this.prisma.trail.findMany({
      where: {
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    console.log(
      `TrailRepository.findAll() - Encontradas ${trails.length} trilhas`,
    );
    return trails as Trail[];
  }

  async findById(id: string): Promise<Trail | null> {
    const trail = await this.prisma.trail.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return trail as Trail;
  }

  async findBySlug(slug: string): Promise<Trail | null> {
    const trail = await this.prisma.trail.findUnique({
      where: {
        slug,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return trail as Trail;
  }

  async update(id: string, trailData: Prisma.trailUpdateInput): Promise<Trail> {
    const trail = await this.prisma.trail.update({
      where: { id },
      data: trailData,
      include: this.defaultInclude,
    });

    return trail as Trail;
  }

  async delete(id: string): Promise<Trail> {
    const trail = await this.prisma.trail.delete({
      where: { id },
      include: this.defaultInclude,
    });

    return trail as Trail;
  }
}
