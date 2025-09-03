import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGroupedAnalyticsRoute() {
  try {
    console.log('🧪 Testando rota /analytics/forms/:formId/grouped-analytics...');
    
    // Buscar o formulário específico que está sendo usado no frontend
    // Vou usar o ID que aparece na URL do usuário
    const formId = 'ce5c90c7-0bc6-4108-ac6c-8a21432f83e2';
    
    console.log(`📋 Testando formulário com ID: ${formId}`);
    
    // Verificar se o formulário existe
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    if (!form) {
      console.log('❌ Formulário não encontrado');
      return;
    }

    console.log(`✅ Formulário encontrado: ${form.title} (${form.slug})`);
    
    // Simular exatamente a lógica do AnalyticsService.getGroupedAnalytics
    const formWithQuestions = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: {
                  select: {
                    id: true,
                    name: true,
                    label: true,
                    order: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!formWithQuestions) {
      console.log('❌ Formulário com questões não encontrado');
      return;
    }

    console.log(`\n🔍 Questões encontradas: ${formWithQuestions.questions.length}`);
    
    // Agrupar questões por questionGroup (exatamente como no AnalyticsService)
    const groupsMap = new Map();

    for (const formQuestion of formWithQuestions.questions) {
      const question = formQuestion.question;
      const group = question.questionGroup;
      
      if (!group) continue;

      if (!groupsMap.has(group.id)) {
        groupsMap.set(group.id, {
          id: group.id,
          name: group.name,
          label: group.label || group.name,
          order: group.order || 999,
          questions: []
        });
      }

      // Simular dados básicos da questão (sem cálculos complexos)
      groupsMap.get(group.id).questions.push({
        id: question.id,
        code: question.code || `Q${formQuestion.order}`,
        text: question.text,
        type: question.type,
        order: formQuestion.order || 999,
        options: question.options,
        distribution: [],
        averageScore: 0,
        totalResponses: 0,
        risk: 'low'
      });
    }

    console.log(`\n📊 Grupos encontrados antes da ordenação:`);
    Array.from(groupsMap.values()).forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (order: ${group.order}) - ${group.questions.length} questões`);
    });

    // Aplicar ordenação exatamente como no AnalyticsService
    const groups = Array.from(groupsMap.values())
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        ...group,
        questions: group.questions.sort((a: any, b: any) => a.order - b.order)
      }));

    console.log(`\n✅ Grupos após ordenação (como retornado pela API):`);
    groups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (order: ${group.order}) - ${group.questions.length} questões`);
    });

    // Simular a resposta da API
    const apiResponse = {
      formId,
      formTitle: form.title,
      department: 'all',
      totalResponses: 0,
      groups
    };

    console.log(`\n📡 Resposta simulada da API:`);
    console.log(JSON.stringify(apiResponse, null, 2));

    // Verificar se a ordenação está correta
    let isOrdered = true;
    for (let i = 1; i < groups.length; i++) {
      if (groups[i].order <= groups[i-1].order) {
        isOrdered = false;
        console.log(`⚠️ Ordenação incorreta: ${groups[i-1].name} (${groups[i-1].order}) vs ${groups[i].name} (${groups[i].order})`);
      }
    }

    if (isOrdered) {
      console.log('✅ Ordenação dos grupos está correta na API');
    } else {
      console.log('❌ Ordenação dos grupos está incorreta na API');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGroupedAnalyticsRoute();

