import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const TEST_FORM_ID = '1fde513c-1f82-439c-9d74-51d618582c2e';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Teste específico para o formulário de teste
 */
async function testSpecificForm(): Promise<TestResult> {
  console.log('🧪 [SpecificTest] Iniciando teste do formulário específico...');
  console.log(`📋 Formulário: Formulário de Teste - 5 Perguntas (com grupos)`);
  console.log(`🆔 ID: ${TEST_FORM_ID}\n`);
  
  try {
    // 1. Buscar formulário
    console.log('📋 [SpecificTest] Buscando formulário...');
    const formResponse = await axios.get(`${API_BASE_URL}/forms/${TEST_FORM_ID}`);
    const form = formResponse.data;
    console.log(`✅ [SpecificTest] Formulário encontrado: ${form.title}`);
    
    // 2. Buscar questões
    console.log('📝 [SpecificTest] Buscando questões...');
    const questionsResponse = await axios.get(`${API_BASE_URL}/questions/form/${TEST_FORM_ID}`);
    const questions = questionsResponse.data || [];
    console.log(`✅ [SpecificTest] ${questions.length} questões encontradas\n`);
    
    // 3. Mostrar detalhes das questões
    console.log('📋 [SpecificTest] Detalhes das questões:');
    questions.forEach((question: any, index: number) => {
      console.log(`\n   ${index + 1}. ${question.text}`);
      console.log(`      Tipo: ${question.type}`);
      if (question.options && question.options.length > 0) {
        console.log(`      Opções: ${question.options.join(', ')}`);
      }
      if (question.questionGroup) {
        console.log(`      Grupo: ${question.questionGroup.title}`);
      }
    });
    
    // 4. Simular respostas
    console.log('\n🎯 [SpecificTest] Simulando respostas...');
    const simulatedAnswers = questions.map((question: any) => {
      let answer: any;
      
      switch (question.type) {
        case 'scale_intensity':
        case 'scale_frequency':
          answer = Math.floor(Math.random() * 5) + 1;
          break;
        
        case 'qualitative':
        case 'single_choice':
          if (question.options && question.options.length > 0) {
            const randomIndex = Math.floor(Math.random() * question.options.length);
            answer = question.options[randomIndex];
          } else {
            answer = 'Resposta padrão';
          }
          break;
        
        case 'multiple_choice':
          if (question.options && question.options.length > 0) {
            const numChoices = Math.floor(Math.random() * Math.min(3, question.options.length)) + 1;
            const shuffled = [...question.options].sort(() => 0.5 - Math.random());
            answer = shuffled.slice(0, numChoices);
          } else {
            answer = ['Resposta padrão'];
          }
          break;
        
        case 'text':
          answer = `Resposta de texto simulada para: ${question.text}`;
          break;
        
        case 'number':
          answer = Math.floor(Math.random() * 100) + 1;
          break;
        
        default:
          answer = 'Resposta padrão';
      }
      
      return {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        answer
      };
    });
    
    // 5. Mostrar respostas simuladas
    console.log('\n📝 [SpecificTest] Respostas simuladas:');
    simulatedAnswers.forEach((answer: any, index: number) => {
      console.log(`\n   ${index + 1}. ${answer.questionText}`);
      console.log(`      Tipo: ${answer.questionType}`);
      console.log(`      Resposta: ${JSON.stringify(answer.answer)}`);
    });
    
    // 6. Resumo final
    console.log('\n📊 [SpecificTest] RESUMO DO TESTE:');
    console.log('=' .repeat(50));
    console.log(`✅ Formulário carregado: ${form.title}`);
    console.log(`✅ Questões encontradas: ${questions.length}`);
    console.log(`✅ Respostas simuladas: ${simulatedAnswers.length}`);
    
    // Contar por tipo de questão
    const typeCounts: { [key: string]: number } = {};
    questions.forEach((q: any) => {
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    });
    
    console.log('\n📈 Distribuição por tipo:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} questões`);
    });
    
    console.log('\n🎉 [SpecificTest] Teste concluído com sucesso!');
    
    return {
      success: true,
      message: `Formulário de teste processado com ${questions.length} questões`,
      data: {
        formId: TEST_FORM_ID,
        formTitle: form.title,
        questionsCount: questions.length,
        answersSimulated: simulatedAnswers.length,
        typeDistribution: typeCounts
      }
    };
    
  } catch (error: any) {
    console.error('❌ [SpecificTest] Erro no teste:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return {
      success: false,
      message: 'Erro no teste do formulário específico',
      error: error.message
    };
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 [SpecificTest] Iniciando teste do formulário específico...\n');
  
  const result = await testSpecificForm();
  
  if (result.success) {
    console.log('\n✅ [SpecificTest] Teste executado com sucesso!');
    process.exit(0);
  } else {
    console.log('\n❌ [SpecificTest] Teste falhou!');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { testSpecificForm };


