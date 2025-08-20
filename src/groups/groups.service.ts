import { Injectable, NotFoundException } from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { Group } from '../../prisma/types';
import { GroupRepository } from '../repositories/group-repository';
import { OrganizationRepository } from '../repositories/organization-repositorie';
import { QueryParserService } from '../shared/query-parser/query-parser.service';
import { UtilsService } from '../shared/utils/utils.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly queryParserService: QueryParserService,
    private readonly utilsService: UtilsService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    let slug = this.utilsService.makeSlug(createGroupDto.name);

    const existingBySlug = await this.groupRepository.findBySlug(slug);
    if (existingBySlug) {
      slug = this.utilsService.makeSlug(createGroupDto.name);
    }

    // Criar o grupo primeiro
    const group = await this.groupRepository.create({
      name: createGroupDto.name,
      slug: slug,
      createdBy: createGroupDto.createdById
        ? {
            connect: { id: createGroupDto.createdById },
          }
        : undefined,
    });

    console.log('group2', group);
    // Se há organizações para vincular, atualiza elas para pertencer a este grupo
    if (
      createGroupDto.organizationIds &&
      createGroupDto.organizationIds.length > 0
    ) {
      console.log(
        'createGroupDto.organizationIds',
        createGroupDto.organizationIds,
      );
      for (const organizationId of createGroupDto.organizationIds) {
        await this.organizationRepository.update(organizationId, {
          group: {
            connect: { id: group.id },
          },
        });
      }
    }

    // Buscar o grupo criado com as organizações vinculadas
    const createdGroup = await this.groupRepository.findById(
      group.id.toString(),
    );
    if (!createdGroup) {
      throw new NotFoundException(`Erro ao buscar grupo criado`);
    }

    return createdGroup;
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.findAll();
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Group>> {
    // Processar a query usando o QueryParserService
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query groups original:', query);
    console.log(
      'Query groups processada:',
      JSON.stringify(parsedQuery, null, 2),
    );

    return this.groupRepository.findWithQuery(parsedQuery);
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }
    return group;
  }

  async findBySlug(slug: string): Promise<Group> {
    const group = await this.groupRepository.findBySlug(slug);
    if (!group) {
      throw new NotFoundException(`Grupo com slug '${slug}' não encontrado`);
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    // Verificar se o grupo existe
    const existingGroup = await this.groupRepository.findById(id);
    if (!existingGroup) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    const updateData: any = {};

    if (updateGroupDto.name) {
      updateData.name = updateGroupDto.name;
    }

    // Se há organizações para vincular, atualiza elas
    if (updateGroupDto.organizationIds) {
      // Vincular as novas organizações ao grupo
      for (const organizationId of updateGroupDto.organizationIds) {
        await this.organizationRepository.update(organizationId, {
          group: {
            connect: { id: parseInt(id) },
          },
        });
      }
    }

    return this.groupRepository.update(id, updateData);
  }

  async remove(id: string): Promise<Group> {
    // Verificar se o grupo existe
    const existingGroup = await this.groupRepository.findById(id);
    if (!existingGroup) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    return this.groupRepository.delete(id);
  }

  async removeByName(name: string, userId?: string): Promise<Group> {
    console.log('🔥 name:', name);
    console.log('🔥 userId:', userId);
    const group = await this.groupRepository.findByName(name, userId);
    console.log('🔥 group:', group);
    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    return this.groupRepository.delete(group.id.toString());
  }
}
