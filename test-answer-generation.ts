import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnswerGeneration() {
  console.log('🧪 Testando geração de respostas corrigida...\n');

  // Buscar uma questão de escala
  const question = await prisma.question.findFirst({
    where: {
      type: 'scale_intensity'
    },
    select: {
      id: true,
      code: true,
      text: true,
      type: true,
      options: true
    }
  });

  if (!question) {
    console.log('❌ Nenhuma questão encontrada');
    return;
  }

  console.log(`🔍 Testando com questão: ${question.code} (${question.type})`);
  console.log(`📝 Texto: ${question.text.substring(0, 80)}...`);
  console.log('📊 Opções no banco:', JSON.stringify(question.options, null, 2));

  // Simular a lógica corrigida
  let options: any[] = [];
  
  if (question.options) {
    // Se as opções estão no formato { opt: [...] }, extrair o array
    if (typeof question.options === 'object' && 'opt' in question.options) {
      options = (question.options as any).opt || [];
      console.log('\n📦 Formato detectado: { opt: [...] }');
    }
    // Se as opções são um array direto
    else if (Array.isArray(question.options)) {
      options = question.options;
      console.log('\n📦 Formato detectado: Array direto');
    }
  }
  
  if (options.length > 0 && options[0].valor !== undefined) {
    const values = options.map((opt: any) => opt.valor).filter((val: any) => val !== undefined);
    console.log('✅ Valores extraídos:', values);
    
    // Gerar 5 respostas de exemplo
    console.log('\n🎯 Exemplos de respostas que seriam salvas:');
    for (let i = 0; i < 5; i++) {
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const correspondingOption = options.find((opt: any) => opt.valor === randomValue);
      console.log(`   ${i + 1}. Valor: ${randomValue} (${typeof randomValue}) → "${correspondingOption?.label}"`);
    }
  } else {
    console.log('❌ Estrutura de opções não reconhecida ou não tem propriedade "valor"');
    console.log('🔍 Primeira opção:', JSON.stringify(options[0], null, 2));
  }

  // Testar também com respostas já existentes no banco
  console.log('\n🗄️ Verificando respostas existentes no banco:');
  const existingAnswers = await prisma.answer.findMany({
    where: {
      questionId: question.id
    },
    select: {
      value: true
    },
    take: 5
  });

  if (existingAnswers.length > 0) {
    console.log('📋 Respostas atuais no banco:');
    existingAnswers.forEach((ans, i) => {
      console.log(`   ${i + 1}. "${ans.value}" (${typeof ans.value})`);
    });
  } else {
    console.log('   ℹ️ Nenhuma resposta encontrada para esta questão');
  }
  
  await prisma.$disconnect();
}

testAnswerGeneration().catch(console.error);
