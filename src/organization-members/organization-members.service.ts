import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { OrganizationMember } from '../../prisma/types';
import { OrganizationMemberRepository } from '../repositories/organization-member-repository';
import { QueryParserService } from '../shared/query-parser/query-parser.service';
import { CreateOrganizationMemberDto } from './dto/create-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';

@Injectable()
export class OrganizationMembersService {
  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly queryParserService: QueryParserService,
  ) {}

  async create(
    createOrganizationMemberDto: CreateOrganizationMemberDto,
  ): Promise<OrganizationMember> {
    // Verificar se já existe membro com o mesmo profile e organização
    const existingMembers =
      await this.organizationMemberRepository.findByOrganizationId(
        createOrganizationMemberDto.organizationId,
      );

    const existingMember = existingMembers.find(
      (member) => member.profileId === createOrganizationMemberDto.profileId,
    );

    if (existingMember) {
      throw new ConflictException(`Usuário já é membro desta organização`);
    }

    return this.organizationMemberRepository.create({
      profile: {
        connect: { id: createOrganizationMemberDto.profileId },
      },
      organization: {
        connect: { id: createOrganizationMemberDto.organizationId },
      },
      role: createOrganizationMemberDto.role || 'collaborator',
      status: createOrganizationMemberDto.status || 'pending',
    });
  }

  async findAll(): Promise<OrganizationMember[]> {
    return this.organizationMemberRepository.findAll();
  }

  async findWithQuery(
    query: any,
  ): Promise<FindWithQueryResult<OrganizationMember>> {
    // Processar a query usando o QueryParserService
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query organization-members original:', query);
    console.log(
      'Query organization-members processada:',
      JSON.stringify(parsedQuery, null, 2),
    );

    return this.organizationMemberRepository.findWithQuery(parsedQuery);
  }

  async findOne(id: string): Promise<OrganizationMember> {
    const member = await this.organizationMemberRepository.findById(id);
    if (!member) {
      throw new NotFoundException(
        `Membro da organização com ID ${id} não encontrado`,
      );
    }
    return member;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    return this.organizationMemberRepository.findByOrganizationId(
      organizationId,
    );
  }

  async update(
    id: string,
    updateOrganizationMemberDto: UpdateOrganizationMemberDto,
  ): Promise<OrganizationMember> {
    // Verificar se o membro existe
    const existingMember = await this.organizationMemberRepository.findById(id);
    if (!existingMember) {
      throw new NotFoundException(
        `Membro da organização com ID ${id} não encontrado`,
      );
    }

    // Converter os valores para os tipos corretos do Prisma
    const updateData: any = {};
    if (updateOrganizationMemberDto.role) {
      updateData.role = updateOrganizationMemberDto.role;
    }
    if (updateOrganizationMemberDto.status) {
      updateData.status = updateOrganizationMemberDto.status;
    }

    return this.organizationMemberRepository.update(id, updateData);
  }

  async remove(id: string): Promise<OrganizationMember> {
    // Verificar se o membro existe
    const existingMember = await this.organizationMemberRepository.findById(id);
    if (!existingMember) {
      throw new NotFoundException(
        `Membro da organização com ID ${id} não encontrado`,
      );
    }

    return this.organizationMemberRepository.delete(id);
  }

  async removeMemberFromOrganization(
    profileId: string,
    organizationId: string,
  ): Promise<OrganizationMember> {
    // Buscar o membro específico
    const members =
      await this.organizationMemberRepository.findByOrganizationId(
        organizationId,
      );
    const member = members.find((m) => m.profileId === profileId);

    if (!member) {
      throw new NotFoundException(`Usuário não é membro desta organização`);
    }

    return this.organizationMemberRepository.delete(member.id);
  }

  async updateMemberRole(
    profileId: string,
    organizationId: string,
    newRole: string,
  ): Promise<OrganizationMember> {
    // Buscar o membro específico
    const members =
      await this.organizationMemberRepository.findByOrganizationId(
        organizationId,
      );
    const member = members.find((m) => m.profileId === profileId);

    if (!member) {
      throw new NotFoundException(`Usuário não é membro desta organização`);
    }

    return this.organizationMemberRepository.update(member.id, {
      role: newRole as any,
    });
  }
}
