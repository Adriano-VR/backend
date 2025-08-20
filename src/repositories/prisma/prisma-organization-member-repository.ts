import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrganizationMember } from '../../../prisma/types';
import { PrismaGenericRepository } from '../generic-repository-method';
import { OrganizationMemberRepository } from '../organization-member-repository';

@Injectable()
export class PrismaOrganizationMemberRepository
  extends PrismaGenericRepository<OrganizationMember>
  implements OrganizationMemberRepository
{
  protected entityName = 'organizationMember';
  protected defaultInclude = {
    profile: true,
    organization: true,
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(
    user: Prisma.organizationMemberCreateInput,
  ): Promise<OrganizationMember> {
    const result = await this.prisma.organizationMember.create({
      data: user,
      include: this.defaultInclude,
    });

    return result as OrganizationMember;
  }

  async update(
    id: string,
    user: Prisma.organizationMemberUpdateInput,
  ): Promise<OrganizationMember> {
    const result = await this.prisma.organizationMember.update({
      where: { id },
      data: user,
      include: this.defaultInclude,
    });

    return result as OrganizationMember;
  }

  async delete(id: string): Promise<OrganizationMember> {
    const result = await this.prisma.organizationMember.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.defaultInclude,
    });

    return result as OrganizationMember;
  }

  async findAll(): Promise<OrganizationMember[]> {
    const result = await this.prisma.organizationMember.findMany({
      where: { deletedAt: null },
      include: this.defaultInclude,
    });

    return result as OrganizationMember[];
  }

  async findById(id: string): Promise<OrganizationMember | null> {
    const result = await this.prisma.organizationMember.findUnique({
      where: { id },
      include: this.defaultInclude,
    });

    return result as OrganizationMember;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    const result = await this.prisma.organizationMember.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return result as OrganizationMember[];
  }
}
