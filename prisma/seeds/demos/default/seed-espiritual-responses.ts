import { PrismaClient, QuestionType, Status } from '@prisma/client';

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
    case 'scale_intensity':
    case 'scale_frequency':
      if (options.length > 0 && options[0].valor !== undefined) {
        // Para escalas com { valor: number, label: string }
        const values = options.map(opt => opt.valor).filter(val => val !== undefined);
        if (values.length > 0) {
          // Distribuição mais realística para formulários espirituais
          const random = Math.random();
          const sortedValues = values.sort((a, b) => a - b);
          
          if (random < 0.15) return sortedValues[0]; // 15% - valor mínimo
          if (random < 0.35) return sortedValues[1] || sortedValues[0]; // 20% - segundo menor
          if (random < 0.60) return sortedValues[Math.floor(sortedValues.length / 2)]; // 25% - médio
          if (random < 0.85) return sortedValues[sortedValues.length - 2] || sortedValues[sortedValues.length - 1]; // 25% - segundo maior
          return sortedValues[sortedValues.length - 1]; // 15% - valor máximo
        }
      }
      // Fallback para escalas simples 1-5
      return Math.floor(Math.random() * 5) + 1;

    case 'multiple_choice':
      if (options.length > 0) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return randomOption.value !== undefined ? randomOption.value : randomOption.valor !== undefined ? randomOption.valor : randomOption;
      }
      return 'A';

    case 'text':
      // Respostas textuais específicas para questões espirituais
      const spiritualTextResponses = [
        'Estou em um processo de autoconhecimento.',
        'Tenho buscado desenvolver minha espiritualidade.',
        'Ainda estou descobrindo meu propósito.',
        'Sinto que estou evoluindo espiritualmente.',
        'Estou trabalhando para alinhar meus valores com minhas ações.',
        'Busco equilíbrio entre corpo, mente e espírito.',
        'Tenho encontrado paz interior através da meditação.',
        'Estou aprendendo a gerenciar melhor meus pensamentos.',
        'Sinto que estou no caminho certo.',
        'Ainda tenho muito a aprender sobre mim mesmo.'
      ];
      return spiritualTextResponses[Math.floor(Math.random() * spiritualTextResponses.length)];

    case 'qualitative':
      if (options.length > 0) {
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return randomOption.value !== undefined ? randomOption.value : randomOption.valor !== undefined ? randomOption.valor : randomOption;
      }
      // Fallback se não houver opções específicas
      const fallbackResponses = [
        'Em desenvolvimento',
        'Bom progresso',
        'Satisfatório',
        'Bem equilibrado'
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    case 'number':
      // Para questões numéricas, usar um range apropriado
      return Math.floor(Math.random() * 10) + 1;

    default:
      return 'Resposta espiritual simulada';
  }
}

/**
 * Gera status aleatório para submitted forms espirituais
 */
function generateRandomStatus(): Status {
  const statuses: Status[] = ['completed', 'in_progress', 'pending'];
  const weights = [0.8, 0.15, 0.05]; // 80% completed, 15% in_progress, 5% pending

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
 * Busca formulários espirituais (organizacionais - não templates)
 */
async function getEspiritualForms() {
  return await prisma.form.findMany({
    where: {
      isTemplate: false,
      deletedAt: null,
      OR: [
        {
          title: {
            contains: 'Espiritual'
          }
        },
        {
          title: {
            contains: 'espiritual'
          }
        },
        {
          slug: {
            contains: 'espiritual'
          }
        },
        {
          description: {
            contains: 'Djalma'
          }
        },
        {
          title: {
            contains: 'QS'
          }
        },
        {
          title: {
            contains: 'Inteligência'
          }
        }
      ]
    },
    include: {
      organization: true,
      questions: {
        include: {
          question: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  });
}

/**
 * Busca colaboradores para criar respostas
 */
async function getCollaborators() {
  return await prisma.profile.findMany({
    where: {
      role: 'collaborator',
      deletedAt: null
    },
    include: {
      organizationMemberships: {
        include: {
          organization: true
        }
      }
    }
  });
}

/**
 * Cria submitted form espiritual com respostas simuladas válidas
 */
async function createEspiritualSubmittedFormWithAnswers(
  formId: string,
  profileId: string,
  questions: any[]
) {
  const status = generateRandomStatus();
  const startedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Últimos 30 dias

  let completedAt: Date | null = null;
  if (status === 'completed') {
    // Completed entre 1 hora e 2 dias após started (formulários espirituais são mais rápidos)
    completedAt = new Date(
      startedAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
    );
  }

  // Criar submitted form
  const submittedForm = await prisma.submittedForm.create({
    data: {
      formId,
      profileId,
      status,
      startedAt,
      completedAt
    }
  });

  console.log(`✅ Submitted form espiritual criado: ${submittedForm.id} (Status: ${status})`);

  // Criar respostas para as questões
  let answersCreated = 0;
  const questionsToAnswer = status === 'pending'
    ? []
    : status === 'in_progress'
      ? questions.slice(0, Math.floor(questions.length * 0.7)) // 70% das questões para espirituais
      : questions; // Todas as questões para completed

  for (const formQuestion of questionsToAnswer) {
    try {
      const answer = await generateValidAnswer(
        formQuestion.question.id,
        formQuestion.question.type
      );

      await prisma.answer.create({
        data: {
          submittedFormId: submittedForm.id,
          questionId: formQuestion.question.id,
          value: String(answer)
        }
      });

      answersCreated++;
    } catch (error) {
      console.error(`❌ Erro ao criar resposta para questão ${formQuestion.question.id}:`, error);
    }
  }

  console.log(`   📝 ${answersCreated} respostas espirituais válidas criadas`);
  return submittedForm;
}

async function main() {
  console.log(
    '🌱 [Espiritual Responses Seed] Iniciando criação de respostas do formulário espiritual...'
  );

  try {
    // Buscar formulários espirituais
    const espiritualForms = await getEspiritualForms();

    if (espiritualForms.length === 0) {
      console.log('⚠️  Nenhum formulário espiritual encontrado.');
      
      // Debug: mostrar todos os formulários organizacionais existentes
      const allForms = await prisma.form.findMany({
        where: {
          isTemplate: false,
          deletedAt: null
        },
        select: {
          id: true,
          title: true,
          slug: true,
          organizationId: true
        }
      });
      
      console.log('📋 Formulários organizacionais existentes:');
      allForms.forEach(form => {
        console.log(
          `   - ${form.title} (ID: ${form.id}, Slug: ${form.slug}, OrgID: ${form.organizationId})`
        );
      });
      
      console.log(
        '💡 Execute primeiro: npm run seed:organizations-forms para disponibilizar o formulário espiritual nas organizações'
      );
      return;
    }

    console.log(`📋 ${espiritualForms.length} formulário(s) espiritual(is) encontrado(s):`);
    espiritualForms.forEach(form => {
      console.log(
        `   - ${form.title} (ID: ${form.id}, Slug: ${form.slug}) (${form.questions.length} questões) - ${form.organization?.name || 'Sem organização'}`
      );
    });

    // Buscar colaboradores
    const collaborators = await getCollaborators();

    if (collaborators.length === 0) {
      console.log('⚠️  Nenhum colaborador encontrado.');
      console.log('💡 Execute primeiro: npm run seed:basic');
      return;
    }

    console.log(`👥 ${collaborators.length} colaborador(es) encontrado(s)`);

    // Criar respostas para cada formulário espiritual
    for (const form of espiritualForms) {
      console.log(`\n📝 Processando formulário: ${form.title} (ID: ${form.id})`);
      console.log(`   📊 Questões disponíveis: ${form.questions.length}`);
      
      // Criar 3-5 respostas por formulário
      const numResponses = Math.floor(Math.random() * 3) + 3; // 3-5 respostas
      console.log(`   🎯 Criando ${numResponses} respostas...`);
      
      for (let i = 0; i < numResponses; i++) {
        const randomCollaborator = collaborators[Math.floor(Math.random() * collaborators.length)];
        console.log(`   👤 Usando colaborador: ${randomCollaborator.name} (${randomCollaborator.email})`);
        
        try {
          await createEspiritualSubmittedFormWithAnswers(
            form.id,
            randomCollaborator.id,
            form.questions
          );
        } catch (error) {
          console.error(`❌ Erro ao criar resposta ${i + 1} para ${form.title}:`, error);
        }
      }
    }

    console.log('\n🎉 Respostas espirituais válidas criadas com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - Formulários processados: ${espiritualForms.length}`);
    console.log(`   - Colaboradores utilizados: ${collaborators.length}`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export default main;