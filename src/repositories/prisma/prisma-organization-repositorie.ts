import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Organization } from 'prisma/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGenericRepository } from '../generic-repository-method';
import { OrganizationRepository } from '../organization-repositorie';

@Injectable()
export class PrismaOrganizationRepository
  extends PrismaGenericRepository<Organization>
  implements OrganizationRepository
{
  protected entityName = 'organization';
  protected defaultInclude = undefined;
  protected prisma: PrismaService;

  constructor(prisma: PrismaService) {
    super();
    this.prisma = prisma;
  }

  async create(
    organization: Prisma.organizationCreateInput,
  ): Promise<Organization> {
    const newOrganization = await this.prisma.organization.create({
      data: organization,
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return newOrganization as Organization;
  }

  async findAll(): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return organizations as Organization[];
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return organization as Organization;
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: { createdById: userId },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: {
              include: {
                department: true,
              },
            },
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return organizations as Organization[];
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return organization as Organization;
  }

  async findByRegistrationCode(
    registrationCode: string,
  ): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { registrationCode },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return organization as Organization;
  }

  async findByCnpj(
    cnpj: string,
  ): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { cnpj },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return organization as Organization;
  }

  async findByCreatedById(createdById: string): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: { createdById },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
      },
    });

    return organizations as Organization[];
  }

  async findActiveOrganizations(): Promise<Organization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
      },
    });

    return organizations as Organization[];
  }

  async update(
    id: string,
    organization: Prisma.organizationUpdateInput,
  ): Promise<Organization> {
    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: organization,
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
        address: true,
      },
    });

    return updatedOrganization as Organization;
  }

  async delete(id: string): Promise<Organization> {
    const organization = await this.prisma.organization.delete({
      where: { id },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
      },
    });

    return organization as Organization;
  }

  async findByInviteCode(inviteCode: string): Promise<Organization | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { inviteCode },
    });

    return organization as Organization;
  }

  async associateProfileToOrg(
    profileId: string,
    orgId: string,
  ): Promise<Organization> {
    // Criar o registro na tabela organizationMember ao invés de conectar diretamente
    await this.prisma.organizationMember.create({
      data: {
        profileId: profileId,
        organizationId: orgId,
        role: 'collaborator', // Role padrão, pode ser parametrizado se necessário
        status: 'active',
      },
    });

    // Retornar a organização atualizada com os members incluídos
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        createdBy: true,
        departments: true,
        forms: true,
        members: {
          include: {
            profile: true,
          },
        },
        group: true,
        projects: true,
      },
    });

    return organization as Organization;
  }

  async findByName(name: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        name: name,
        deletedAt: null,
      },
    });
  }

  async findByNameAndCreatedBy(
    name: string,
    createdById: string,
  ): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        name: name,
        createdById: createdById,
        deletedAt: null,
      },
    });
  }
}
