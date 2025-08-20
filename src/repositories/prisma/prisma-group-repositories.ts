import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Group } from '../../../prisma/types';
import { PrismaGenericRepository } from '../generic-repository-method';
import { GroupRepository } from '../group-repository';

@Injectable()
export class PrismaGroupRepository
  extends PrismaGenericRepository<Group>
  implements GroupRepository
{
  protected entityName = 'group';
  protected defaultInclude = {
    organizations: true,
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(group: Prisma.groupCreateInput): Promise<Group> {
    const result = await this.prisma.group.create({
      data: group,
      include: this.defaultInclude,
    });

    return result as Group;
  }

  async update(id: string, group: Prisma.groupUpdateInput): Promise<Group> {
    const result = await this.prisma.group.update({
      where: { id: parseInt(id) },
      data: group,
      include: this.defaultInclude,
    });

    return result as Group;
  }

  async delete(id: string): Promise<Group> {
    const result = await this.prisma.group.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });

    return result as Group;
  }

  async findAll(): Promise<Group[]> {
    const result = await this.prisma.group.findMany({
      where: { deletedAt: null },
      include: this.defaultInclude,
    });

    return result as Group[];
  }

  async findById(id: string): Promise<Group | null> {
    const result = await this.prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: this.defaultInclude,
    });

    return result as Group;
  }

  async findBySlug(slug: string): Promise<Group | null> {
    return this.prisma.group.findFirst({
      where: {
        slug: slug,
        deletedAt: null,
      },
    });
  }

  async findByName(name: string, userId?: string): Promise<Group | null> {
    const where: any = {
      name: name,
      deletedAt: null,
    };

    if (userId) {
      where.createdById = userId;
    }

    return this.prisma.group.findFirst({
      where,
    });
  }
}
