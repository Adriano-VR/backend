import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFormQuestions() {
  const form = await prisma.form.findFirst({
    where: { 
      slug: { contains: 'copsoq' },
      isTemplate: true 
    },
    include: {
      questions: {
        include: {
          question: {
            include: {
              questionGroup: true
            }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!form) {
    console.log('❌ Nenhum formulário COPSOQ encontrado');
    return;
  }

  console.log(`📋 Formulário: ${form.title}`);
  console.log(`📊 Total de questões: ${form.questions.length}`);
  
  const groupStats = new Map();
  
  form.questions.forEach((fq, index) => {
    const q = fq.question;
    const group = q.questionGroup;
    
    console.log(`${index + 1}. ${q.code || 'NO_CODE'} - ${q.text.substring(0, 50)}...`);
    console.log(`   Grupo: ${group ? group.name : 'SEM GRUPO'} (ID: ${group?.id || 'NULL'})`);
    
    if (group) {
      if (!groupStats.has(group.name)) {
        groupStats.set(group.name, { count: 0, order: group.order });
      }
      groupStats.get(group.name).count++;
    }
  });
  
  console.log('\n📊 Estatísticas por Grupo:');
  Array.from(groupStats.entries())
    .sort((a, b) => a[1].order - b[1].order)
    .forEach(([name, stats]) => {
      console.log(`   ${stats.order}. ${name}: ${stats.count} questões`);
    });
}

checkFormQuestions().then(() => process.exit(0)).catch(console.error);
