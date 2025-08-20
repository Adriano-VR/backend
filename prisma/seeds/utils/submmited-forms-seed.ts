import { PrismaClient, QuestionType, Status } from '@prisma/client';
import { getActiveExampleOrganizations } from './organizations-forms';

const prisma = new PrismaClient();

/**
 * Busca as opções válidas de uma questão no banco de dados
 */
async function getQuestionOptions(questionId: string): Promise<any[]> {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { options: true, type: true }
  });

  if (!question || !question.options) {
    return [];
  }

  // Se as opções estão no formato { opt: [...] }, extrair o array
  if (typeof question.options === 'object' && 'opt' in question.options) {
    return (question.options as any).opt || [];
  }

  // Se as opções são um array direto
  if (Array.isArray(question.options)) {
    return question.options;
  }

  return [];
}

/**
 * Gera uma resposta simulada válida baseada nas opções reais da questão
 */
async function generateValidAnswer(questionId: string, questionType: QuestionType): Promise<any> {
  const options = await getQuestionOptions(questionId);

  switch (questionType) {
    case 'scale_frequency':
    case 'scale_intensity': {
      if (options.length > 0 && options[0].valor !== undefined) {
        // Para escalas com { valor: number, label: string }
        const values = options.map(opt => opt.valor).filter(val => val !== undefined);
        if (values.length > 0) {
          // Distribuição realística para questionários de saúde mental/organizacional
          const random = Math.random();
          const sortedValues = values.sort((a, b) => a - b);
          
          if (random < 0.1) return sortedValues[0]; // 10% - valor mínimo
          if (random < 0.3) return sortedValues[1] || sortedValues[0]; // 20% - segundo menor
          if (random < 0.6) return sortedValues[Math.floor(sortedValues.length / 2)]; // 30% - médio
          if (random < 0.85) return sortedValues[sortedValues.length - 2] || sortedValues[sortedValues.length - 1]; // 25% - segundo maior
          return sortedValues[sortedValues.length - 1]; // 15% - valor máximo
        }
      }
      // Fallback para escalas simples (1-5 mais comum)
      return Math.floor(Math.random() * 5) + 1;
    }

    case 'multiple_choice': {
      if (options.length > 0) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return randomOption.value !== undefined ? randomOption.value : randomOption.valor !== undefined ? randomOption.valor : randomOption;
      }
      // Fallback
      const fallbackOptions = ['A', 'B', 'C', 'D'];
      return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    }

    case 'text': {
      // Gera texto simulado baseado na pergunta
      const textResponses = [
        'Prefiro não comentar sobre este assunto.',
        'Acredito que é uma questão importante para nosso ambiente de trabalho.',
        'Tenho observado melhorias neste aspecto recentemente.',
        'Considero este tema relevante para nossa equipe.',
        'Esta é uma área que pode ser desenvolvida.',
      ];
      return textResponses[Math.floor(Math.random() * textResponses.length)];
    }

    case 'number':
      // Gera número entre 1 e 10
      return Math.floor(Math.random() * 10) + 1;

    case 'qualitative': {
      if (options.length > 0) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return randomOption.value !== undefined ? randomOption.value : randomOption.valor !== undefined ? randomOption.valor : randomOption;
      }
      // Fallback se não houver opções específicas
      const qualitativeResponses = [
        'Satisfatório',
        'Bom',
        'Regular',
        'Precisa melhorar',
      ];
      return qualitativeResponses[Math.floor(Math.random() * qualitativeResponses.length)];
    }

    default:
      return 'Resposta simulada';
  }
}

/**
 * Gera status aleatório para submitted forms
 */
function generateRandomStatus(): Status {
  const statuses: Status[] = ['completed', 'in_progress', 'pending'];
  const weights = [0.7, 0.2, 0.1]; // 70% completed, 20% in_progress, 10% pending

  const random = Math.random();
  let weightSum = 0;

  for (let i = 0; i < statuses.length; i++) {
    weightSum += weights[i];
    if (random <= weightSum) {
      return statuses[i];
    }
  }

  return 'completed';
}

/**
 * Busca formulários organizacionais (não templates)
 */
async function getOrganizationalForms(orgId: string) {
  return await prisma.form.findMany({
    where: {
      isTemplate: false,
      deletedAt: null,
      organizationId: orgId,
    },
    include: {
      organization: true,
      questions: {
        include: {
          question: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });
}

/**
 * Busca colaboradores das organizações
 */
async function getOrganizationCollaborators(orgId: string) {
  return await prisma.profile.findMany({
    where: {
      role: { in: ['collaborator', 'manager', 'professional'] },
      deletedAt: null,
      organizationMemberships: {
        some: {
          status: 'active',
          deletedAt: null,
          organizationId: orgId,
        },
      },
    },
    include: {
      organizationMemberships: {
        where: {
          status: 'active',
          deletedAt: null,
          organizationId: orgId,
        },
        include: {
          organization: true,
        },
      },
    },
  });
}

/**
 * Cria submitted form com respostas simuladas válidas
 */
async function createSubmittedFormWithAnswers(
  formId: string,
  profileId: string,
  questions: any[]
) {
  const status = generateRandomStatus();
  const startedAt = new Date(
    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
  ); // Últimos 30 dias

  let completedAt: Date | null = null;
  if (status === 'completed') {
    // Completed entre 1 hora e 3 dias após started
    completedAt = new Date(
      startedAt.getTime() +
        Math.random() * 3 * 24 * 60 * 60 * 1000 +
        60 * 60 * 1000,
    );
  }

  // Criar submitted form
  const submittedForm = await prisma.submittedForm.create({
    data: {
      formId,
      profileId,
      status,
      startedAt,
      completedAt,
    },
  });

  console.log(
    `✅ Submitted form criado: ${submittedForm.id} (Status: ${status})`,
  );

  // Criar respostas para as questões
  let answersCreated = 0;
  const questionsToAnswer =
    status === 'pending'
      ? []
      : status === 'in_progress'
        ? questions.slice(0, Math.floor(questions.length * 0.6)) // 60% das questões
        : questions; // Todas as questões para completed

  for (const formQuestion of questionsToAnswer) {
    try {
      const answer = await generateValidAnswer(
        formQuestion.question.id,
        formQuestion.question.type,
      );

      await prisma.answer.create({
        data: {
          submittedFormId: submittedForm.id,
          questionId: formQuestion.question.id,
          value: String(answer),
        },
      });

      answersCreated++;
    } catch (error) {
      console.error(
        `❌ Erro ao criar resposta para questão ${formQuestion.question.id}:`,
        error
      );
    }
  }

  console.log(`   📝 ${answersCreated} respostas válidas criadas`);
  return submittedForm;
}

async function main(orgFilter: string[]) {
  console.log(
    '🌱 [Submitted Forms Seed] Iniciando criação de formulários submetidos...',
  );

  try {
    const organizations = await getActiveExampleOrganizations(orgFilter);

    for (const organization of organizations) {
      const organizationId = organization.id;

      if (!organizationId) {
        console.log('⚠️  Nenhuma organização encontrada.');
        console.log('💡 Execute primeiro: npm run seed:basic');

        throw new Error('Nenhuma organização encontrada.');
      }

      // Buscar formulários organizacionais
      const organizationalForms = await getOrganizationalForms(organizationId);

      if (organizationalForms.length === 0) {
        console.log('⚠️  Nenhum formulário organizacional encontrado.');
        console.log('💡 Execute primeiro: npm run seed:organizations-forms');
        return;
      }

      console.log(
        `📋 ${organizationalForms.length} formulário(s) organizacional(is) encontrado(s):`,
      );
      organizationalForms.forEach((form) => {
        console.log(
          `   - ${form.title} (${form.questions.length} questões) - ${form.organization?.name}`,
        );
      });

      // Buscar colaboradores
      const collaborators = await getOrganizationCollaborators(organizationId);

      if (collaborators.length === 0) {
        console.log('⚠️  Nenhum colaborador encontrado.');
        console.log('💡 Execute primeiro: npm run seed:basic');
        return;
      }

      console.log(`👥 ${collaborators.length} colaborador(es) encontrado(s):`);
      collaborators.forEach((collab) => {
        console.log(
          `   - ${collab.name} (${collab.role}) - ${collab.organizationMemberships.length} organização(ões)`,
        );
      });

      // Verificar formulários já submetidos para evitar duplicatas
      const existingSubmissions = await prisma.submittedForm.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          formId: true,
          profileId: true,
        },
      });

      const existingSubmissionsSet = new Set(
        existingSubmissions.map((sub) => `${sub.formId}-${sub.profileId}`),
      );

      // Criar submitted forms para cada combinação colaborador-formulário
      let totalSubmitted = 0;
      for (const collaborator of collaborators) {
        console.log(`\n👤 Processando colaborador: ${collaborator.name}`);

        // Para cada organização do colaborador
        for (const membership of collaborator.organizationMemberships) {
          const organizationForms = organizationalForms.filter(
            (form) => form.organizationId === membership.organizationId,
          );

          console.log(
            `   🏢 Organização: ${membership.organization.name} (${organizationForms.length} formulários)`,
          );

          // Para cada formulário da organização
          for (const form of organizationForms) {
            const submissionKey = `${form.id}-${collaborator.id}`;

            if (existingSubmissionsSet.has(submissionKey)) {
              console.log(
                `   ⚠️  Já existe submissão para o formulário "${form.title}"`,
              );
              continue;
            }

            // 80% de chance de criar uma submissão (simula que nem todos respondem todos os formulários)
            if (Math.random() < 0.8) {
              try {
                await createSubmittedFormWithAnswers(
                  form.id,
                  collaborator.id,
                  form.questions,
                );
                totalSubmitted++;
              } catch (error: any) {
                console.error(
                  `   ❌ Erro ao criar submissão para "${form.title}":`,
                  error.message,
                );
              }
            } else {
              console.log(
                `   ⏭️  Pulando formulário "${form.title}" (simulação)`,
              );
            }
          }
        }
      }

      console.log(`\n🎉 [Submitted Forms Seed] Seed concluído!`);
      console.log(
        `📊 Total de formulários submetidos criados: ${totalSubmitted}`,
      );

      // Estatísticas finais
      const stats = await prisma.submittedForm.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        where: {
          deletedAt: null,
        },
      });

      console.log('\n📈 Estatísticas dos formulários submetidos:');
      stats.forEach((stat) => {
        console.log(`   - ${stat.status}: ${stat._count.id} formulários`);
      });
    }
  } catch (error: any) {
    console.error('❌ Erro ao executar seed de formulários submetidos:', error);
    throw error;
  }
}

// Exporta a função para ser usada em outros seeds
export default main;

// Executa apenas se o arquivo foi chamado diretamente
if (require.main === module) {
  main(['detran', 'organizacao-exemplo'])
    .catch((e) => {
      console.error('❌ Erro ao executar seed de formulários submetidos:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}