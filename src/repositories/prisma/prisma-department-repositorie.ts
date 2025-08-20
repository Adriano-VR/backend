import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AssociateProfileToDepartmentDto } from 'src/departments/dto/associate-profile-to-department';
import { Department } from '../../../prisma/types';
import { PrismaService } from '../../prisma/prisma.service';
import { DepartmentRepository } from '../department-repositorie';
import {
  FindWithQueryResult,
  PrismaGenericRepository,
} from '../generic-repository-method';

@Injectable()
export class PrismaDepartmentRepository
  extends PrismaGenericRepository<Department>
  implements DepartmentRepository
{
  protected entityName = 'department';
  protected defaultInclude = {
    organization: true,
    profiles: true,
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(department: Prisma.departmentCreateInput): Promise<Department> {
    const result = await this.prisma.department.create({
      data: department,
      include: this.defaultInclude,
    });

    if (result.id) {
      console.log('Departamento criado com sucesso', result.name);
    }

    return result;
  }

  async update(
    id: string,
    department: Prisma.departmentUpdateInput,
  ): Promise<Department> {
    return this.prisma.department.update({
      where: { id },
      data: department,
      include: this.defaultInclude,
    });
  }

  async delete(id: string): Promise<Department> {
    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });
  }

  async reactivate(id: string): Promise<Department> {
    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: null },
      include: this.defaultInclude,
    });
  }

  async findAll(): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      include: this.defaultInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Department | null> {
    return this.prisma.department.findFirst({
      where: { id, deletedAt: null },
      include: this.defaultInclude,
    });
  }

  async findBySlug(slug: string): Promise<Department | null> {
    return this.prisma.department.findFirst({
      where: { slug, deletedAt: null },
      include: this.defaultInclude,
    });
  }

  async findByOrganizationId(organizationId: string): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { organizationId, deletedAt: null },
      include: this.defaultInclude,
      orderBy: { name: 'asc' },
    });
  }

  async associateProfileToDepartment(
    associateProfileToDepartmentDto: AssociateProfileToDepartmentDto,
  ): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { id: associateProfileToDepartmentDto.departmentId },
    });
    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: associateProfileToDepartmentDto.profileId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return this.prisma.department.update({
      where: { id: associateProfileToDepartmentDto.departmentId },
      data: {
        profiles: {
          connect: { id: associateProfileToDepartmentDto.profileId },
        },
      },
    });
  }

  async findByName(
    name: string,
    organizationId: string,
  ): Promise<Department | null> {
    return this.prisma.department.findFirst({
      where: { name, organizationId, deletedAt: null },
    });
  }

  async findDeletedByName(
    name: string,
    organizationId: string,
  ): Promise<Department | null> {
    return this.prisma.department.findFirst({
      where: { name, organizationId, deletedAt: { not: null } },
      include: {
        organization: true,
        profiles: true,
      },
    });
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Department>> {
    return super.findWithQuery(query);
  }
}
