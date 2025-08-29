import { Injectable, NotFoundException } from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { UtilsService } from 'src/shared/utils';
import { Form } from '../../prisma/types';
import { FormRepository } from '../repositories/form-repositorie';
import { QueryParserService } from '../shared/query-parser/query-parser.service';
import { CloneFormDto } from './dto/clone-form-dto';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(
    private readonly formRepository: FormRepository,
    private readonly queryParserService: QueryParserService,
    private readonly utilsService: UtilsService,
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
    return this.formRepository.cloneForm(cloneFormDto);
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Form>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    return this.formRepository.findWithQuery(parsedQuery);
  }

  async createByTemplate(
    templateId: string,
    organizationId: string,
    createdById: string,
  ): Promise<Form[]> {
    return this.formRepository.cloneForm({
      templateFormIds: [templateId],
      organizationId,
      createdById,
    });
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
