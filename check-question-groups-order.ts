import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuestionGroupsOrder() {
  try {
    console.log('🔍 Verificando ordem dos questionGroups...');
    
    // Buscar todos os questionGroups ordenados por order
    const questionGroups = await prisma.questionGroup.findMany({
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        name: true,
        order: true,
        slug: true
      }
    });

    console.log(`📊 Encontrados ${questionGroups.length} questionGroups:`);
    questionGroups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (order: ${group.order}, slug: ${group.slug})`);
    });

    // Verificar se há groups sem order ou com order duplicado
    const withoutOrder = questionGroups.filter(g => g.order === null || g.order === undefined);
    const duplicateOrders = questionGroups.reduce((acc, curr) => {
      acc[curr.order] = (acc[curr.order] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    if (withoutOrder.length > 0) {
      console.log(`⚠️ Grupos sem order definido: ${withoutOrder.length}`);
      withoutOrder.forEach(g => console.log(`  - ${g.name} (id: ${g.id})`));
    }

    const duplicates = Object.entries(duplicateOrders).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log(`⚠️ Orders duplicados:`);
      duplicates.forEach(([order, count]) => {
        console.log(`  - Order ${order}: ${count} grupos`);
        const groupsWithSameOrder = questionGroups.filter(g => g.order === parseInt(order));
        groupsWithSameOrder.forEach(g => console.log(`    - ${g.name} (id: ${g.id})`));
      });
    }

    // Buscar um formulário específico para testar
    const forms = await prisma.form.findMany({
      take: 1,
      select: {
        id: true,
        title: true
      }
    });

    if (forms.length > 0) {
      const formId = forms[0].id;
      console.log(`\n🔍 Testando formulário: ${forms[0].title} (${formId})`);
      
      const formQuestions = await prisma.formQuestion.findMany({
        where: {
          formId: formId
        },
        include: {
          question: {
            include: {
              questionGroup: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      });

      console.log(`📋 Questões do formulário (${formQuestions.length}):`);
      formQuestions.forEach((fq, index) => {
        const group = fq.question.questionGroup;
        console.log(`  ${index + 1}. Q${fq.order}: ${fq.question.code} - Grupo: ${group?.name || 'SEM GRUPO'} (group.order: ${group?.order || 'N/A'})`);
      });

      // Agrupar por questionGroup para ver a ordem
      const groupsMap = new Map();
      formQuestions.forEach(fq => {
        const group = fq.question.questionGroup;
        if (!group) return;
        
        if (!groupsMap.has(group.id)) {
          groupsMap.set(group.id, {
            name: group.name,
            order: group.order,
            questions: []
          });
        }
        
        groupsMap.get(group.id).questions.push({
          code: fq.question.code,
          order: fq.order
        });
      });

      console.log(`\n📊 Grupos encontrados no formulário:`);
      const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
      groups.forEach((group, index) => {
        console.log(`  ${index + 1}. ${group.name} (order: ${group.order}) - ${group.questions.length} questões`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestionGroupsOrder();
