import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Form } from 'prisma/types';
import { CloneFormDto } from 'src/forms/dto/clone-form-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/shared/utils';
import { FormRepository } from '../form-repositorie';
import { PrismaGenericRepository } from '../generic-repository-method';

@Injectable()
export class PrismaFormRepository
  extends PrismaGenericRepository<Form>
  implements FormRepository
{
  protected entityName = 'form';
  protected defaultInclude = undefined;
  protected prisma: PrismaService;

  constructor(
    prisma: PrismaService,
    private utilsService: UtilsService,
  ) {
    super();
    this.prisma = prisma;
  }

  // Função para gerar slug único
  private generateSlug(title: string): string {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000000);
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')}-${timestamp}-${randomNumber}`;
  }

  async create(user: Prisma.formCreateInput): Promise<Form> {
    const form = await this.prisma.form.create({
      data: user,
    });
    return form;
  }

  async findAll(): Promise<Form[]> {
    const forms = await this.prisma.form.findMany({
      where: { deletedAt: null },
    });
    return forms;
  }

  async findById(id: string): Promise<Form | null> {
    const form = await this.prisma.form.findFirst({
      where: { id, deletedAt: null },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return form as Form;
  }

  async update(id: string, user: Prisma.formUpdateInput): Promise<Form> {
    const form = await this.prisma.form.update({
      where: { id },
      data: user,
    });
    return form;
  }

  async delete(id: string): Promise<Form> {
    const form = await this.prisma.form.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return form;
  }

  async reactivate(id: string): Promise<Form> {
    const form = await this.prisma.form.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return form as Form;
  }

  async findPublicForms(): Promise<Form[]> {
    const forms = await this.prisma.form.findMany({
      where: {
        isTemplate: true,
        deletedAt: null,
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    console.log(forms, `forms - findPublicForms`);
    return forms as Form[];
  }

  // ... resto dos métodos permanecem iguais

  async cloneForm(cloneFormDto: CloneFormDto): Promise<Form[]> {
    const { organizationId, templateFormIds, createdById } = cloneFormDto;
    const clonedForms: Form[] = [];

    for (const templateId of templateFormIds) {
      // Buscar o template original
      const template = await this.prisma.form.findFirst({
        where: {
          id: templateId,
          isTemplate: true,
          deletedAt: null,
        },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  questionGroup: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!template) {
        continue;
      }

      console.log(`🔄 [cloneForm] Clonando template: ${template.title}`);
      console.log(`📄 [cloneForm] Template: ${template.title}`);

      // Criar o formulário clonado
      const clonedForm = await this.prisma.form.create({
        data: {
          title: template.title,
          description: template.description,
          instructions: template.instructions, // Incluindo instructions na clonagem
          limitDate: template.limitDate, // Incluindo limitDate na clonagem
          isTemplate: false,
          organizationId: organizationId,
          createdById: createdById,
          slug: this.generateSlug(template.title),
          qualityDiagnosis: template.qualityDiagnosis || 'default',
          questions: {
            create: template.questions.map((question, index) => ({
              questionId: question.questionId,
              order: question.order,
              required: question.required,
            })),
          },
        },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  questionGroup: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      console.log(`✅ [cloneForm] Formulário clonado: ${clonedForm.title}`);
      console.log(`📄 [cloneForm] Formulário clonado: ${clonedForm.title}`);
      clonedForms.push(clonedForm as Form);
    }

    return clonedForms;
  }

  async findByTemplateIdAndOrganization(
    templateId: string,
    organizationId: string,
  ): Promise<Form | null> {
    const form = await this.prisma.form.findFirst({
      where: {
        templateId: templateId,
        organizationId: organizationId,
        deletedAt: null,
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return form as Form | null;
  }

  async findDeletedByTemplateIdAndOrganization(
    templateId: string,
    organizationId: string,
  ): Promise<Form | null> {
    const form = await this.prisma.form.findFirst({
      where: {
        templateId: templateId,
        organizationId: organizationId,
        deletedAt: { not: null },
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return form as Form | null;
  }
}
