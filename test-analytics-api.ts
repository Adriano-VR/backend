import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalyticsAPI() {
  try {
    console.log('🧪 Testando API de Analytics...');
    
    // Buscar um formulário COPSOQ
    const form = await prisma.form.findFirst({
      where: {
        slug: {
          contains: 'copsoq'
        }
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    if (!form) {
      console.log('❌ Nenhum formulário COPSOQ encontrado');
      return;
    }

    console.log(`📋 Testando formulário: ${form.title} (${form.id})`);
    
    // Simular a lógica do AnalyticsService
    const formWithQuestions = await prisma.form.findUnique({
      where: { id: form.id },
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
      console.log('❌ Formulário não encontrado');
      return;
    }

    console.log(`\n🔍 Questões encontradas: ${formWithQuestions.questions.length}`);
    
    // Agrupar questões por questionGroup
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

      groupsMap.get(group.id).questions.push({
        id: question.id,
        code: question.code || `Q${formQuestion.order}`,
        text: question.text,
        type: question.type,
        order: formQuestion.order || 999,
        options: question.options
      });
    }

    console.log(`\n📊 Grupos encontrados antes da ordenação:`);
    Array.from(groupsMap.values()).forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (order: ${group.order}) - ${group.questions.length} questões`);
    });

    // Aplicar ordenação como no AnalyticsService
    const groups = Array.from(groupsMap.values())
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        ...group,
        questions: group.questions.sort((a: any, b: any) => a.order - b.order)
      }));

    console.log(`\n✅ Grupos após ordenação:`);
    groups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (order: ${group.order}) - ${group.questions.length} questões`);
      // Mostrar primeiras 3 questões de cada grupo
      group.questions.slice(0, 3).forEach((q, qIndex) => {
        console.log(`    ${qIndex + 1}. ${q.code} (order: ${q.order})`);
      });
      if (group.questions.length > 3) {
        console.log(`    ... e mais ${group.questions.length - 3} questões`);
      }
    });

    // Verificar se há inconsistências
    console.log(`\n🔍 Verificando consistência:`);
    const orders = groups.map(g => g.order);
    const uniqueOrders = [...new Set(orders)];
    
    if (orders.length !== uniqueOrders.length) {
      console.log('⚠️ Ainda há orders duplicados nos grupos!');
    } else {
      console.log('✅ Todos os orders dos grupos são únicos');
    }

    // Verificar se a ordenação está correta
    let isOrdered = true;
    for (let i = 1; i < groups.length; i++) {
      if (groups[i].order <= groups[i-1].order) {
        isOrdered = false;
        console.log(`⚠️ Ordenação incorreta: ${groups[i-1].name} (${groups[i-1].order}) vs ${groups[i].name} (${groups[i].order})`);
      }
    }

    if (isOrdered) {
      console.log('✅ Ordenação dos grupos está correta');
    } else {
      console.log('❌ Ordenação dos grupos está incorreta');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsAPI();

