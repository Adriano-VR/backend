import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Profile } from '../../prisma/types';
import { Role } from '../auth/dto/role.enum';
import { ProfileRepository } from '../repositories/profile-repositorie';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Mantendo a dependência do PrismaService apenas para os métodos legacy de registro
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { QueryParserService } from 'src/shared/query-parser/query-parser.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly queryParserService: QueryParserService,
    private readonly prisma: PrismaService, // Para métodos legacy
  ) {}

  // ==================== MÉTODOS CRUD PADRÃO ====================

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    // Verificar se o email já existe
    const emailExists = await this.profileRepository.alredyEmailExists(
      createProfileDto.email,
    );
    if (emailExists) {
      throw new BadRequestException('Email já está em uso');
    }

    // Verificar se o CPF já existe (se fornecido)
    if (createProfileDto.cpf) {
      const existingProfile = await this.profileRepository.findByCpf(
        createProfileDto.cpf,
      );
      if (existingProfile) {
        throw new BadRequestException('CPF já está em uso');
      }
    }

    // Verificar se o slug já existe
    const existingSlug = await this.profileRepository.findBySlug(
      createProfileDto.slug,
    );
    if (existingSlug) {
      throw new BadRequestException('Slug já está em uso');
    }

    return this.profileRepository.create(createProfileDto);
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.findAll();
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }
    return profile;
  }

  async findByEmail(email: string): Promise<Profile> {
    const profile = await this.profileRepository.findByEmail(email);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }
    return profile;
  }

  async findBySlug(slug: string): Promise<Profile> {
    const profile = await this.profileRepository.findBySlug(slug);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }
    return profile;
  }

  async findByDepartmentId(departmentId: string): Promise<Profile[]> {
    return this.profileRepository.findByDepartmentId(departmentId);
  }

  async findByRole(role: string): Promise<Profile[]> {
    return this.profileRepository.findByRole(role);
  }

  async findActiveProfiles(): Promise<Profile[]> {
    return this.profileRepository.findActiveProfiles();
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    // Verifica se o perfil existe
    const existingProfile = await this.profileRepository.findById(id);
    if (!existingProfile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    // Remove campos que não devem ser atualizados diretamente
    const {
      id: profileId,
      createdAt,
      updatedAt,
      slug,
      email,
      ...safeUpdateData
    } = updateProfileDto as any;

    return this.profileRepository.update(id, safeUpdateData);
  }

  async remove(id: string): Promise<Profile> {
    // Verifica se o perfil existe
    const existingProfile = await this.profileRepository.findById(id);
    if (!existingProfile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return this.profileRepository.delete(id);
  }

  async removeByName(name: string, organizationId?: string): Promise<Profile> {
    const profile = await this.profileRepository.findByName(
      name,
      organizationId,
    );
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    return this.profileRepository.delete(profile.id);
  }

  // ==================== MÉTODOS ESPECÍFICOS ====================

  async findAllByMyOrganization(userId: string): Promise<Profile[]> {
    return this.profileRepository.findAllByMyOrganization(userId);
  }

  // ==================== MÉTODOS LEGACY DE REGISTRO ====================
  // Mantendo os métodos existentes para compatibilidade

  private makeSlug(name: string, id: string) {
    return (
      name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + id.slice(0, 8)
    );
  }

  private async checkUserExists(email: string, cpf: string) {
    const [emailExists, cpfExists] = await Promise.all([
      this.profileRepository.alredyEmailExists(email),
      cpf ? this.profileRepository.findByCpf(cpf) : null,
    ]);

    if (emailExists) {
      throw new BadRequestException('Email já está em uso');
    }
    if (cpfExists) {
      throw new BadRequestException('CPF já está em uso');
    }
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Profile>> {
    // Processar a query usando o QueryParserService
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query groups original:', query);
    console.log(
      'Query groups processada:',
      JSON.stringify(parsedQuery, null, 2),
    );

    return this.profileRepository.findWithQuery(parsedQuery);
  }

  async createCollaborator(dto: CreateCollaboratorDto) {
    const org = await this.prisma.organization.findUnique({
      where: { registrationCode: dto.registrationCode },
    });
    if (!org) throw new BadRequestException('Código de registro inválido');

    await this.checkUserExists(dto.email, dto.cpf);

    // Busca o primeiro departamento da organização
    const department = await this.prisma.department.findFirst({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'asc' },
    });
    if (!department)
      throw new BadRequestException('Organização sem departamento disponível');

    const userId = randomUUID();
    const user = await this.prisma.profile.create({
      data: {
        id: userId,
        slug: this.makeSlug(dto.name, userId),
        name: dto.name,
        email: dto.email,
        cpf: dto.cpf,
        role: (dto.role as Role) ?? Role.collaborator,
        emailConfirmed: false,
        departmentId: department.id,
      },
    });

    return { user, organization: org };
  }

  async createProfessional(dto: CreateProfessionalDto) {
    const org = await this.prisma.organization.findUnique({
      where: { headOfficeUuid: dto.organizationCnpj },
    });
    if (!org) throw new BadRequestException('CNPJ não encontrado');

    await this.checkUserExists(dto.email, dto.cpf);

    // Busca o primeiro departamento da organização
    const department = await this.prisma.department.findFirst({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'asc' },
    });
    if (!department)
      throw new BadRequestException('Organização sem departamento disponível');

    const userId = randomUUID();
    const user = await this.prisma.profile.create({
      data: {
        id: userId,
        slug: this.makeSlug(dto.name, userId),
        name: dto.name,
        email: dto.email,
        cpf: dto.cpf,
        role: Role.professional,
        emailConfirmed: false,
        departmentId: department.id,
      },
    });

    return { user, organization: org };
  }
}
