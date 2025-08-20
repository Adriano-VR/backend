import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Profile } from 'prisma/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaGenericRepository } from '../generic-repository-method';
import { ProfileRepository } from '../profile-repositorie';

@Injectable()
export class PrismaProfileRepository
  extends PrismaGenericRepository<Profile>
  implements ProfileRepository
{
  protected entityName = 'profile';
  protected defaultInclude = {
    department: {
      include: {
        organization: true,
      },
    },
    createdForms: true,
    createdProjects: true,
    notifications: true,
    organizationsCreated: true,
    submittedForms: true,
    userCourseProgresses: true,
    organizationMemberships: {
      include: {
        organization: true,
      },
    },
  };

  constructor(protected prisma: PrismaService) {
    super();
  }

  private getIncludeOptions() {
    return this.defaultInclude;
  }

  async create(profileData: Prisma.profileCreateInput): Promise<Profile> {
    console.log(profileData, 'profileData');

    const newProfile = await this.prisma.profile.create({
      data: profileData,
      include: this.getIncludeOptions(),
    });

    return newProfile as Profile;
  }

  async findAll(): Promise<Profile[]> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return profiles as Profile[];
  }

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: this.getIncludeOptions(),
    });

    return profile as Profile | null;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { email },
      include: this.getIncludeOptions(),
    });

    return profile as Profile | null;
  }

  async findBySlug(slug: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { slug },
      include: this.getIncludeOptions(),
    });

    return profile as Profile | null;
  }

  async findByCpf(cpf: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { cpf },
      include: this.getIncludeOptions(),
    });

    return profile as Profile | null;
  }

  async findByDepartmentId(departmentId: string): Promise<Profile[]> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        departmentId,
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: {
        name: 'asc',
      },
    });

    return profiles as Profile[];
  }

  async findByRole(role: string): Promise<Profile[]> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        role: role as any,
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: {
        name: 'asc',
      },
    });

    return profiles as Profile[];
  }

  async findActiveProfiles(): Promise<Profile[]> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        deletedAt: null,
        emailConfirmed: true,
      },
      include: this.getIncludeOptions(),
      orderBy: {
        name: 'asc',
      },
    });

    return profiles as Profile[];
  }

  async findAllByMyOrganization(userId: string): Promise<Profile[]> {
    // Primeiro, encontrar o profile do usuário para obter o departamento
    const userProfile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        department: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!userProfile?.department?.organization) {
      return [];
    }

    // Buscar todos os profiles da mesma organização
    const profiles = await this.prisma.profile.findMany({
      where: {
        department: {
          organizationId: userProfile.department.organization.id,
        },
        deletedAt: null,
      },
      include: this.getIncludeOptions(),
      orderBy: {
        name: 'asc',
      },
    });

    return profiles as Profile[];
  }

  async alredyEmailExists(email: string): Promise<boolean> {
    const profile = await this.prisma.profile.findFirst({
      where: {
        email: email,
        deletedAt: null,
      },
    });

    return !!profile;
  }

  async findByName(
    name: string,
    organizationId?: string,
  ): Promise<Profile | null> {
    const where: any = {
      name: name,
      deletedAt: null,
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    return this.prisma.profile.findFirst({
      where,
    });
  }

  async update(
    id: string,
    profileData: Prisma.profileUpdateInput,
  ): Promise<Profile> {
    const updatedProfile = await this.prisma.profile.update({
      where: { id },
      data: profileData,
      include: this.getIncludeOptions(),
    });

    return updatedProfile as Profile;
  }

  async delete(id: string): Promise<Profile> {
    // Soft delete - atualiza o campo deletedAt
    const deletedProfile = await this.prisma.profile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      include: this.getIncludeOptions(),
    });

    return deletedProfile as Profile;
  }
}
