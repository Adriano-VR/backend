import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CloneOptions {
    templateFormId: string;
    organizationId: string;
    createdById: string;
    titleSuffix?: string;
}

/**
 * Clona um formulário de template para uma organização específica
 */
async function cloneFormTemplate(options: CloneOptions) {
    const { templateFormId, organizationId, createdById, titleSuffix = '' } = options;

    // Buscar o template com suas questões
    const template = await prisma.form.findUnique({
        where: { id: templateFormId },
        include: {
            questions: {
                include: {
                    question: true,
                },
                orderBy: {
                    order: 'asc'
                }
            },
        },
    });

    if (!template) {
        throw new Error(`❌ Template de formulário com ID '${templateFormId}' não encontrado`);
    }

    if (!template.isTemplate) {
        throw new Error(`❌ O formulário '${template.title}' não é um template`);
    }

    console.log(`📝 Clonando template: ${template.title}`);

    // Criar novo formulário baseado no template
    const clonedForm = await prisma.form.create({
        data: {
            slug: `${template.slug}${titleSuffix}`,
            title: `${template.title}${titleSuffix}`,
            description: template.description,
            isTemplate: false,
            qualityDiagnosis: 'default',
            createdBy: {
                connect: { id: createdById }
            },
            organization: {
                connect: { id: organizationId }
            },
        },
    });

    console.log(`✅ Formulário clonado criado: ${clonedForm.title} (ID: ${clonedForm.id})`);

    // Clonar os vínculos das questões (formQuestion)
    for (const templateQuestion of template.questions) {
        await prisma.formQuestion.create({
            data: {
                formId: clonedForm.id,
                questionId: templateQuestion.questionId,
                order: templateQuestion.order,
                required: templateQuestion.required,
                hidden: templateQuestion.hidden,
            },
        });
    }

    console.log(`✅ ${template.questions.length} questões vinculadas ao formulário clonado`);

    return clonedForm;
}

/**
 * Busca todos os formulários template disponíveis
 */
async function getAvailableTemplates() {
    const templates = await prisma.form.findMany({
        where: {
            isTemplate: true,
            deletedAt: null
        },
        select: {
            id: true,
            title: true,
            description: true,
            questions: {
                select: {
                    id: true
                }
            }
        },
        orderBy: {
            title: 'asc'
        }
    });

    return templates;
}

/**
 * Busca organizações ativas para clonar formulários
 */
export async function getActiveExampleOrganizations(organizationSlugs: string[]) {
    const organizations = await prisma.organization.findMany({
        where: {
            slug: {
                in: organizationSlugs
            },
            deletedAt: null
        },
        include: {
            createdBy: true,
            members: {
                where: {
                    status: 'active'
                },
                include: {
                    profile: true
                },
                take: 1
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    return organizations;
}

async function main(orgFilter: string[]) {
    console.log('🌱 [Organizations Forms Seed] Iniciando clonagem de formulários para organizações...');

    try {
        // Buscar templates disponíveis
        const templates = await getAvailableTemplates();

        if (templates.length === 0) {
            console.log('⚠️  Nenhum template de formulário encontrado no banco de dados.');
            console.log('💡 Execute primeiro o seed dos templates: npm run seed:templates');
            return;
        }

        console.log(`📋 ${templates.length} template(s) de formulário encontrado(s):`);
        templates.forEach(template => {
            console.log(`   - ${template.title} (ID: ${template.id}) (${template.questions.length} questões)`);
        });

        // Buscar organizações ativas
        const organizations = await getActiveExampleOrganizations(orgFilter);

        if (organizations.length === 0) {
            console.log('⚠️  Nenhuma organização de exemplo encontrada no banco de dados.');
            console.log('💡 Execute primeiro o seed básico: npm run seed:basic');
            return;
        }

        console.log(`🏢 ${organizations.length} organização(ões) de exemplo ativa(s) encontrada(s):`);
        organizations.forEach(org => {
            console.log(`   - ${org.name}`);
            console.log(org.createdById);
        });

        // Clonar templates para cada organização
        let totalCloned = 0;
        for (const organization of organizations) {
            console.log(`\n🏢 Processando organização: ${organization.name}`);

            // Determinar usuário criador (proprietário da organização ou primeiro membro ativo)
            const createdById = organization.createdById ||
                organization.members[0]?.profileId;

            if (!createdById) {
                console.log(`⚠️  Nenhum usuário válido encontrado para a organização ${organization.name}. Pulando...`);
                continue;
            }

            // Verificar se a organização já possui formulários
            const existingForms = await prisma.form.findMany({
                where: {
                    organizationId: organization.id,
                    isTemplate: false,
                    deletedAt: null
                }
            });

            if (existingForms.length > 0) {
                console.log(`   ⚠️  Organização já possui ${existingForms.length} formulário(s). Pulando clonagem...`);
                console.log(`   📋 Formulários existentes:`);
                existingForms.forEach(form => {
                    console.log(`      - ${form.title} (ID: ${form.id})`);
                });
                continue;
            }

            // Clonar cada template para esta organização
            for (const template of templates) {
                // Verificar se já existe um formulário baseado neste template
                const existingForm = await prisma.form.findFirst({
                    where: {
                        organizationId: organization.id,
                        isTemplate: false,
                        deletedAt: null,
                        title: {
                            contains: template.title.split(' - ')[0] // Pega apenas o título base
                        }
                    }
                });

                if (existingForm) {
                    console.log(`   ⚠️  Formulário baseado em '${template.title}' já existe: ${existingForm.title}`);
                    continue;
                }

                try {
                    await cloneFormTemplate({
                        templateFormId: template.id,
                        organizationId: organization.id,
                        createdById,
                        titleSuffix: ` - ${organization.name}`
                    });
                    totalCloned++;
                } catch (error: any) {
                    if (error.message.includes('Unique constraint failed')) {
                        console.log(`   ⚠️  Formulário '${template.title}' já existe para esta organização`);
                    } else {
                        console.error(`   ❌ Erro ao clonar template '${template.title}':`, error.message);
                    }
                }
            }
        }

        console.log(`\n🎉 [Organizations Forms Seed] Clonagem concluída!`);
        console.log(`📊 Total de formulários clonados: ${totalCloned}`);

    } catch (error: any) {
        console.error('❌ Erro ao executar seed de formulários organizacionais:', error);
        throw error;
    }
}

// Exporta a função para ser usada em outros seeds
export default main;

// Executa apenas se o arquivo foi chamado diretamente
if (require.main === module) {
    main(["detran", "organizacao-exemplo"])
        .catch((e) => {
            console.error('❌ Erro ao executar seed de formulários organizacionais:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}