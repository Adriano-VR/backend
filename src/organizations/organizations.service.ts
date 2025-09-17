import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { ProfileRepository } from 'src/repositories/profile-repositorie';
import { UtilsService } from 'src/shared/utils';
import { Organization } from '../../prisma/types';
import { OrganizationRepository } from '../repositories/organization-repositorie';
import { OrganizationMemberRepository } from '../repositories/organization-member-repository';
import { QueryParserService } from '../shared/query-parser/query-parser.service';
import { AssociateProfileToOrgDto } from './dto/associate-profile-to-org';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly queryParserService: QueryParserService,
    private readonly profileRepository: ProfileRepository,
    private readonly utilsService: UtilsService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    // Usar o slug enviado pelo frontend em vez de gerar um novo
    let slug = createOrganizationDto.slug;
    
    // Verificar se slug já existe e gerar um novo apenas se necessário
    const existingBySlug = await this.organizationRepository.findBySlug(slug);
    if (existingBySlug) {
      // Se o slug já existe, gerar um novo usando a mesma lógica determinística
      // Para manter consistência com o frontend, vamos usar um hash baseado no nome
      slug = this.generateDeterministicSlug(createOrganizationDto.name);
    }

    // Verificar se código de registro já existe (se fornecido)
    if (createOrganizationDto.registrationCode) {
      const existingByCode =
        await this.organizationRepository.findByRegistrationCode(
          createOrganizationDto.registrationCode,
        );
      if (existingByCode) {
        throw new ConflictException(
          `Organização com código de registro '${createOrganizationDto.registrationCode}' já existe`,
        );
      }
    }

    // Verificar se userId já existe (se fornecido)
    if (createOrganizationDto.userId) {
      const existingByUserId = await this.organizationRepository.findByUserId(
        createOrganizationDto.userId,
      );
      if (existingByUserId) {
        throw new ConflictException(
          `Usuário já possui uma organização associada`,
        );
      }
    }

    const inviteCode = await this.generateInviteCode();

    // Separar o createdById do resto dos dados para usar a estrutura correta do Prisma
    const { createdById, ...organizationData } = createOrganizationDto;

    const createData: any = {
      ...organizationData,
      inviteCode,
      slug: slug,
    };

    // Se createdById for fornecido, usar a estrutura de relacionamento do Prisma
    if (createdById) {
      createData.createdBy = {
        connect: { id: createdById },
      };
    }

    // Criar a organização
    const organization = await this.organizationRepository.create(createData);

    // Se createdById foi fornecido, criar o membro admin automaticamente
    if (createdById) {
      console.log(`🔧 [OrganizationsService] Criando membro admin para criador da organização:`, {
        profileId: createdById,
        organizationId: organization.id
      });
      
      try {
        await this.organizationMemberRepository.create({
          profile: {
            connect: { id: createdById },
          },
          organization: {
            connect: { id: organization.id },
          },
          role: 'admin',
          status: 'active',
        });
        console.log(`✅ [OrganizationsService] Membro admin criado com sucesso`);
      } catch (error) {
        console.error('❌ [OrganizationsService] Erro ao criar membro admin:', error);
        // Não vamos falhar a criação da organização por causa deste erro
      }
    }

    return organization;
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.findAll();
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Organization>> {
    // Processar a query usando o QueryParserService
    const parsedQuery = this.queryParserService.parseQuery(query);

    return this.organizationRepository.findWithQuery(parsedQuery);
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }
    return organization;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const organization = await this.organizationRepository.findBySlug(slug);
    if (!organization) {
      throw new NotFoundException(
        `Organização com slug '${slug}' não encontrada`,
      );
    }
    return organization;
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    console.log('🔍 [OrganizationsService] Buscando organizações para userId:', userId)
    const organizations = await this.organizationRepository.findByUserId(userId);
    console.log('🔍 [OrganizationsService] Organizações encontradas (raw):', organizations)
    
    // Log detalhado de cada organização
    if (organizations && organizations.length > 0) {
      organizations.forEach((org, index) => {
        console.log(`🔍 [OrganizationsService] Organização ${index + 1}:`, {
          id: org.id,
          name: org.name,
          slug: org.slug,
          slugType: typeof org.slug,
          slugLength: org.slug?.length
        })
      })
    }
    
    if (!organizations) {
      throw new NotFoundException(
        `Nenhuma organização encontrada para o usuário ${userId}`,
      );
    }
    return organizations;
  }

  async findByRegistrationCode(
    registrationCode: string,
  ): Promise<Organization> {
    const organization =
      await this.organizationRepository.findByRegistrationCode(
        registrationCode,
      );
    if (!organization) {
      throw new NotFoundException(
        `Organização com código '${registrationCode}' não encontrada`,
      );
    }
    return organization;
  }

  async findByCreatedById(createdById: string): Promise<Organization[]> {
    return this.organizationRepository.findByCreatedById(createdById);
  }

  async findActiveOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.findActiveOrganizations();
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationRepository.findById(id);
    if (!existingOrganization) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }

    // Verificar conflitos apenas se os valores estão sendo alterados
    if (
      updateOrganizationDto.slug &&
      updateOrganizationDto.slug !== existingOrganization.slug
    ) {
      const existingBySlug = await this.organizationRepository.findBySlug(
        updateOrganizationDto.slug,
      );
      if (existingBySlug) {
        throw new ConflictException(
          `Organização com slug '${updateOrganizationDto.slug}' já existe`,
        );
      }
    }

    if (
      updateOrganizationDto.cnpj &&
      updateOrganizationDto.cnpj !== existingOrganization.cnpj
    ) {
      const existingByCnpj = await this.organizationRepository.findByCnpj(
        updateOrganizationDto.cnpj,
      );
      if (existingByCnpj) {
        throw new ConflictException(
          `Organização com CNPJ '${updateOrganizationDto.cnpj}' já existe`,
        );
      }
    }

    if (
      updateOrganizationDto.registrationCode &&
      updateOrganizationDto.registrationCode !==
        existingOrganization.registrationCode
    ) {
      const existingByCode =
        await this.organizationRepository.findByRegistrationCode(
          updateOrganizationDto.registrationCode,
        );
      if (existingByCode) {
        throw new ConflictException(
          `Organização com código de registro '${updateOrganizationDto.registrationCode}' já existe`,
        );
      }
    }

    if (
      updateOrganizationDto.userId &&
      updateOrganizationDto.userId !== existingOrganization.userId
    ) {
      const existingByUserId = await this.organizationRepository.findByUserId(
        updateOrganizationDto.userId,
      );
      if (existingByUserId) {
        throw new ConflictException(
          `Usuário já possui uma organização associada`,
        );
      }
    }

    // Filtrar campos que não devem ser atualizados diretamente ou que não existem
    const { createdById, mentalHealthActions, ...filteredData } =
      updateOrganizationDto as any;

    // Usar o slug enviado pelo frontend se disponível, senão gerar um novo baseado no nome
    let slug = updateOrganizationDto.slug;
    if (!slug && updateOrganizationDto.name) {
      slug = this.utilsService.makeSlug(updateOrganizationDto.name);
    }
    
    // Se precisar atualizar o createdBy, use a estrutura de conexão do Prisma
    const updateData: any = filteredData;

    if (createdById && createdById !== existingOrganization.createdById) {
      updateData.createdBy = {
        connect: { id: createdById },
      };
    }

    if (slug && slug !== existingOrganization.slug) {
      updateData.slug = slug;
    }

    // Se mentalHealthActions estiver sendo enviado, adicione às settings
    if (mentalHealthActions) {
      updateData.settings = {
        ...(filteredData.settings || {}),
        mentalHealthActions,
      };
    }

    console.log(updateData, 'updateData-org');

    return this.organizationRepository.update(id, updateData);
  }

  async updateSettings(
    id: string,
    updateSettingsDto: UpdateOrganizationSettingsDto,
  ): Promise<Organization> {
    const existingOrganization = await this.organizationRepository.findById(id);
    if (!existingOrganization) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }

    // Preparar dados para atualização das settings
    const currentSettings = existingOrganization.settings as any || {};
    const updateData: any = {};

    // Se formApplicationFrequency for fornecido, adicionar às settings
    if (updateSettingsDto.formApplicationFrequency) {
      updateData.settings = {
        ...currentSettings,
        formApplicationFrequency: updateSettingsDto.formApplicationFrequency,
      };
    }

    // Se outras settings forem fornecidas, mesclar com as existentes
    if (updateSettingsDto.settings) {
      updateData.settings = {
        ...updateData.settings,
        ...updateSettingsDto.settings,
      };
    }

    // Se não há nada para atualizar, retornar a organização atual
    if (Object.keys(updateData).length === 0) {
      return existingOrganization;
    }

    return this.organizationRepository.update(id, updateData);
  }

  async remove(id: string): Promise<Organization> {
    const existingOrganization = await this.organizationRepository.findById(id);
    if (!existingOrganization) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }
    return this.organizationRepository.delete(id);
  }

  async removeByName(name: string, userId?: string): Promise<Organization> {
    let organization;

    console.log(name, userId, 'name-userId-roodsadlsa');

    if (userId) {
      // Buscar organização por nome E criada pelo usuário específico
      organization = await this.organizationRepository.findByNameAndCreatedBy(
        name,
        userId,
      );
    } else {
      // Buscar organização apenas por nome
      organization = await this.organizationRepository.findByName(name);
    }

    if (!organization) {
      throw new NotFoundException('Organização não encontrada');
    }

    return this.organizationRepository.delete(organization.id);
  }

  /**
   * Gera um slug determinístico baseado no nome, replicando a lógica do frontend
   * @param name Nome da organização
   * @returns Slug determinístico
   */
  private generateDeterministicSlug(name: string): string {
    // Remover caracteres especiais e espaços, converter para minúsculas
    const cleanText = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
    
    // Gerar um número baseado no hash do texto para ser determinístico
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Converte para 32-bit integer
    }
    
    // Usar o valor absoluto do hash para gerar um número de 6 dígitos
    const number = Math.abs(hash) % 1000000
    
    return cleanText + '-' + number.toString().padStart(6, '0')
  }

  async generateInviteCode(): Promise<string> {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    const existingByInviteCode =
      await this.organizationRepository.findByInviteCode(result);
    if (existingByInviteCode) {
      return this.generateInviteCode();
    }

    return result;
  }

  async associateProfileToOrg(
    data: AssociateProfileToOrgDto,
  ): Promise<Organization> {
    const existingProfile = await this.profileRepository.findById(
      data.profileId,
    );
    if (!existingProfile) {
      throw new NotFoundException(
        `Perfil com ID ${data.profileId} não encontrado`,
      );
    }

    const existingOrg = await this.organizationRepository.findByInviteCode(
      data.inviteCode,
    );
    if (!existingOrg) {
      throw new NotFoundException(
        `Organização com ID ${data.inviteCode} não encontrada`,
      );
    }

    return this.organizationRepository.associateProfileToOrg(
      data.profileId,
      existingOrg.id,
    );
  }

  async getSettings(id: string): Promise<any> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organização com ID ${id} não encontrada`);
    }

    // Retornar apenas as configurações relevantes
    const settings = organization.settings as any || {};
    return {
      id: organization.id,
      name: organization.name,
      settings: settings,
      formApplicationFrequency: settings.formApplicationFrequency || 'semestral',
    };
  }
}
