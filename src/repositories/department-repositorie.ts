import { Prisma } from '@prisma/client';
import { AssociateProfileToDepartmentDto } from 'src/departments/dto/associate-profile-to-department';
import { Department } from '../../prisma/types';
import { PrismaGenericRepository } from './generic-repository-method';

export abstract class DepartmentRepository extends PrismaGenericRepository<Department> {
  abstract create(
    department: Prisma.departmentCreateInput,
  ): Promise<Department>;
  abstract update(
    id: string,
    department: Prisma.departmentUpdateInput,
  ): Promise<Department>;
  abstract delete(id: string): Promise<Department>;
  abstract reactivate(id: string): Promise<Department>;
  abstract findAll(): Promise<Department[]>;
  abstract findById(id: string): Promise<Department | null>;
  abstract findBySlug(slug: string): Promise<Department | null>;
  abstract findByOrganizationId(organizationId: string): Promise<Department[]>;
  abstract associateProfileToDepartment(
    associateProfileToDepartmentDto: AssociateProfileToDepartmentDto,
  ): Promise<Department>;
  abstract findByName(
    name: string,
    organizationId: string,
  ): Promise<Department | null>;
  abstract findDeletedByName(
    name: string,
    organizationId: string,
  ): Promise<Department | null>;
}
