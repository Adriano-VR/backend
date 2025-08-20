import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAnswers() {
  const recentAnswers = await prisma.answer.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 15,
    select: {
      value: true,
      createdAt: true
    }
  });

  console.log('🔍 Verificando as 15 respostas mais recentes:');
  console.log('============================================');
  
  recentAnswers.forEach((answer, i) => {
    const answerValue = answer.value;
    console.log(`${i + 1}. Resposta: ${answerValue} (tipo: ${typeof answerValue})`);
  });

  // Verificar se há respostas inválidas (labels em vez de valores)
  const invalidAnswers = recentAnswers.filter(answer => {
    const val = answer.value;
    return typeof val === 'string' && (
      val.includes('Muito') || 
      val.includes('Regular') || 
      val.includes('Excelente') || 
      val.includes('Bom') || 
      val.includes('Satisfatório')
    );
  });

  console.log(`\n📊 Estatísticas:`);
  console.log(`   Total de respostas: ${recentAnswers.length}`);
  console.log(`   Respostas inválidas (labels): ${invalidAnswers.length}`);
  console.log(`   Respostas válidas (valores): ${recentAnswers.length - invalidAnswers.length}`);

  if (invalidAnswers.length > 0) {
    console.log(`\n❌ Respostas inválidas encontradas:`);
    invalidAnswers.forEach((answer, i) => {
      console.log(`   ${i + 1}. "${answer.value}"`);
    });
  } else {
    console.log(`\n✅ Todas as respostas estão usando valores corretos!`);
  }
  
  await prisma.$disconnect();
}

checkAnswers().catch(console.error);

