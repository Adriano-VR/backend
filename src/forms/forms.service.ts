import { Injectable, NotFoundException } from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { UtilsService } from 'src/shared/utils';
import { Form } from '../../prisma/types';
import { FormRepository } from '../repositories/form-repositorie';
import { QueryParserService } from '../shared/query-parser/query-parser.service';
import { CloneFormDto } from './dto/clone-form-dto';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RoleBasedNotificationsService } from '../notifications/role-based-notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(
    private readonly formRepository: FormRepository,
    private readonly queryParserService: QueryParserService,
    private readonly utilsService: UtilsService,
    private readonly notificationsService: NotificationsService,
    private readonly roleBasedNotifications: RoleBasedNotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createFormDto: CreateFormDto): Promise<Form> {
    let slug = this.utilsService.makeSlug(createFormDto.title);

    const existingBySlug = await this.formRepository.findBySlug(slug);
    if (existingBySlug) {
      slug = this.utilsService.makeSlug(createFormDto.title);
    }

    // Separar os campos de relacionamento para usar a estrutura correta do Prisma
    const { createdById, organizationId, ...formData } = createFormDto;

    const dataCreateForm: any = {
      ...formData,
      slug: slug,
    };

    // Se createdById for fornecido, usar a estrutura de relacionamento do Prisma
    if (createdById) {
      dataCreateForm.createdBy = {
        connect: { id: createdById },
      };
    }

    // Se organizationId for fornecido, usar a estrutura de relacionamento do Prisma
    if (organizationId) {
      dataCreateForm.organization = {
        connect: { id: organizationId },
      };
    }

    return this.formRepository.create(dataCreateForm);
  }

  async findAll(): Promise<Form[]> {
    return this.formRepository.findAll();
  }

  /**
   * Notifica todos os colaboradores da organização sobre um novo formulário disponível
   */
  private async notifyCollaboratorsAboutNewForm(form: Form) {
    try {
      console.log(`🔔 [FormsService] Notificando colaboradores sobre formulário clonado: ${form.title}`);
      console.log(`🏢 [FormsService] OrganizationId: ${form.organizationId}`);
      
      // Buscar todos os colaboradores da organização
      const collaborators = await this.prisma.organizationMember.findMany({
        where: {
          organizationId: form.organizationId || undefined,
          role: 'collaborator',
          status: {
            in: ['active', 'pending']
          },
        },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      console.log(`🔍 [FormsService] Encontrados ${collaborators.length} colaboradores para notificar`);
      
      // Debug: verificar se há colaboradores na organização
      const allMembers = await this.prisma.organizationMember.findMany({
        where: {
          organizationId: form.organizationId || undefined,
        },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });
      
      console.log(`🔍 [FormsService] Todos os membros da organização:`, allMembers.map(m => ({ 
        id: m.profileId, 
        role: m.role, 
        status: m.status,
        name: m.profile?.name || 'Nome não encontrado'
      })));
      
      if (collaborators.length === 0) {
        console.log(`ℹ️ [FormsService] Nenhum colaborador encontrado na organização. Formulário ficará disponível quando colaboradores se cadastrarem.`);
        return;
      }

      console.log(`👥 [FormsService] Colaboradores:`, collaborators.map(c => ({ 
        id: c.profileId, 
        name: c.profile?.name || 'Nome não encontrado', 
        email: c.profile?.email || 'Email não encontrado' 
      })));

      // Criar notificação para cada colaborador
      for (const collaborator of collaborators) {
        await this.notificationsService.createNotification({
          profileId: collaborator.profileId,
          title: 'Novo formulário disponível',
          message: `O formulário "${form.title}" foi disponibilizado para você responder.`,
        });
        
        console.log(`✅ [FormsService] Notificação enviada para colaborador ${collaborator.profile?.name || 'Nome não encontrado'}`);
      }

      console.log(`🎉 [FormsService] Todas as notificações foram enviadas com sucesso`);
    } catch (error) {
      console.error('❌ [FormsService] Erro ao notificar colaboradores:', error);
    }
  }

  async findOne(id: string): Promise<Form> {
    const form = await this.formRepository.findById(id);
    if (!form) {
      throw new NotFoundException(`Formulário com ID ${id} não encontrado`);
    }
    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto): Promise<Form> {
    const existingForm = await this.formRepository.findById(id);
    if (!existingForm) {
      throw new NotFoundException(`Formulário com ID ${id} não encontrado`);
    }
    return this.formRepository.update(id, updateFormDto);
  }

  async remove(id: string): Promise<Form> {
    const existingForm = await this.formRepository.findById(id);
    if (!existingForm) {
      throw new NotFoundException(`Formulário com ID ${id} não encontrado`);
    }
    return this.formRepository.delete(id);
  }

  async findPublicForms(): Promise<Form[]> {
    try {
      console.log('🔍 [FormsService] findPublicForms iniciado');
      const forms = await this.formRepository.findPublicForms();
      console.log('✅ [FormsService] findPublicForms executado com sucesso:', forms.length);
      return forms;
    } catch (error) {
      console.error('❌ [FormsService] Erro em findPublicForms:', error);
      throw error;
    }
  }

  async cloneForm(cloneFormDto: CloneFormDto): Promise<Form[]> {
    console.log(`🔄 [FormsService] Iniciando clonagem de formulários...`);
    console.log(`📋 [FormsService] CloneFormDto:`, cloneFormDto);
    
    const clonedForms = await this.formRepository.cloneForm(cloneFormDto);
    
    console.log(`✅ [FormsService] Formulários clonados: ${clonedForms.length}`);
    console.log(`📝 [FormsService] Formulários:`, clonedForms.map(f => ({ id: f.id, title: f.title, organizationId: f.organizationId })));
    
    // Notificar apenas colaboradores sobre os novos formulários clonados
    console.log(`🔔 [FormsService] Iniciando notificações para ${clonedForms.length} formulários...`);
    for (const clonedForm of clonedForms) {
      console.log(`🔔 [FormsService] Notificando sobre formulário: ${clonedForm.title}`);
      console.log(`🔔 [FormsService] OrganizationId do formulário: ${clonedForm.organizationId}`);
      
      if (clonedForm.organizationId) {
        await this.roleBasedNotifications.notifyCollaborators(
          clonedForm.organizationId,
          'Novo formulário disponível',
          `O formulário "${clonedForm.title}" foi disponibilizado para você responder.`
        );
      }
    }
    
    console.log(`🎉 [FormsService] Clonagem e notificações concluídas!`);
    return clonedForms;
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Form>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    return this.formRepository.findWithQuery(parsedQuery);
  }

  async createByTemplate(
    templateId: string,
    organizationId: string,
    createdById: string,
    limitDate?: string,
  ): Promise<Form[]> {
    console.log(`🔄 [FormsService] Criando formulário por template: ${templateId}`);
    
    const clonedForms = await this.formRepository.cloneForm({
      templateFormIds: [templateId],
      organizationId,
      createdById,
      limitDate,
    });
    
    console.log(`✅ [FormsService] Formulários criados por template: ${clonedForms.length}`);
    
    // Notificar apenas colaboradores sobre os novos formulários
    for (const clonedForm of clonedForms) {
      console.log(`🔔 [FormsService] Notificando sobre formulário criado por template: ${clonedForm.title}`);
      
      if (clonedForm.organizationId) {
        await this.roleBasedNotifications.notifyCollaborators(
          clonedForm.organizationId,
          'Novo formulário disponível',
          `O formulário "${clonedForm.title}" foi disponibilizado para você responder.`
        );
      }
    }
    
    console.log(`🎉 [FormsService] Criação por template e notificações concluídas!`);
    return clonedForms;
  }



  async removeByTemplate(
    templateId: string,
    organizationId: string,
  ): Promise<Form> {
    console.log(
      `Tentando remover formulário com templateId: ${templateId}, organizationId: ${organizationId}`,
    );

    const existingForm =
      await this.formRepository.findByTemplateIdAndOrganization(
        templateId,
        organizationId,
      );

    console.log(`Formulário encontrado:`, existingForm?.id);

    if (!existingForm) {
      throw new NotFoundException(
        'Formulário não encontrado para este template na organização',
      );
    }

    const result = await this.formRepository.delete(existingForm.id);
    console.log(`Formulário removido com sucesso:`, result.id);

    return result;
  }
}
