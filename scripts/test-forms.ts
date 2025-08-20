import axios from 'axios';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

interface TestConfig {
  baseUrl: string;
  authToken?: string;
  testUserId?: string;
  testOrganizationId?: string;
}

interface FormData {
  id: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

class FormsTester {
  private config: TestConfig;
  private authToken: string | null = null;

  constructor(config: TestConfig) {
    this.config = config;
  }

  /**
   * Autenticar usuário de teste
   */
  async authenticate(): Promise<TestResult> {
    try {
      console.log('🔐 [FormsTester] Iniciando autenticação...');
      
      // Simular login (você pode ajustar conforme sua API de auth)
      const loginResponse = await axios.post(`${this.config.baseUrl}/auth/login`, {
        email:  'colaborador@demo.com',
        password:  '111111'
      });

      this.authToken = loginResponse.data.access_token;
      console.log('✅ [FormsTester] Autenticação realizada com sucesso');
      
      return {
        success: true,
        message: 'Autenticação realizada com sucesso',
        data: { token: this.authToken }
      };
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro na autenticação:', error.message);
      return {
        success: false,
        message: 'Erro na autenticação',
        error: error.message
      };
    }
  }

  /**
   * Buscar formulários disponíveis
   */
  async getForms(): Promise<TestResult> {
    try {
      console.log('📋 [FormsTester] Buscando formulários disponíveis...');
      
      const response = await axios.get(`${this.config.baseUrl}/forms`, {
        headers: this.getAuthHeaders()
      });

      const forms = response.data.data || response.data;
      console.log(`✅ [FormsTester] Encontrados ${forms.length} formulários`);
      
      return {
        success: true,
        message: `Encontrados ${forms.length} formulários`,
        data: forms
      };
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro ao buscar formulários:', error.message);
      return {
        success: false,
        message: 'Erro ao buscar formulários',
        error: error.message
      };
    }
  }

  /**
   * Buscar formulário específico com questões
   */
  async getFormWithQuestions(formId: string): Promise<TestResult> {
    try {
      console.log(`📋 [FormsTester] Buscando formulário ${formId} com questões...`);
      
      const response = await axios.get(`${this.config.baseUrl}/forms/${formId}`, {
        headers: this.getAuthHeaders()
      });

      const questionsResponse = await axios.get(`${this.config.baseUrl}/questions/form/${formId}`, {
        headers: this.getAuthHeaders()
      });

      const formData = response.data;
      const questions = questionsResponse.data || [];
      
      console.log(`✅ [FormsTester] Formulário carregado com ${questions.length} questões`);
      
      return {
        success: true,
        message: `Formulário carregado com ${questions.length} questões`,
        data: {
          ...formData,
          questions
        }
      };
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro ao buscar formulário:', error.message);
      return {
        success: false,
        message: 'Erro ao buscar formulário',
        error: error.message
      };
    }
  }

  /**
   * Criar submitted form
   */
  async createSubmittedForm(formId: string): Promise<TestResult> {
    try {
      console.log(`📝 [FormsTester] Criando submitted form para formulário ${formId}...`);
      
      const response = await axios.post(`${this.config.baseUrl}/submitted-forms`, {
        formId,
        profileId: this.config.testUserId,
        status: 'in_progress'
      }, {
        headers: this.getAuthHeaders()
      });

      const submittedForm = response.data;
      console.log(`✅ [FormsTester] Submitted form criado: ${submittedForm.id}`);
      
      return {
        success: true,
        message: 'Submitted form criado com sucesso',
        data: submittedForm
      };
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro ao criar submitted form:', error.message);
      return {
        success: false,
        message: 'Erro ao criar submitted form',
        error: error.message
      };
    }
  }

  /**
   * Gerar resposta simulada para uma questão
   */
  generateSimulatedAnswer(question: Question): any {
    switch (question.type) {
      case 'scale_intensity':
      case 'scale_frequency':
        // Escala de 1 a 5
        return Math.floor(Math.random() * 5) + 1;
      
      case 'qualitative':
      case 'single_choice':
        // Escolher uma opção aleatória
        if (question.options && question.options.length > 0) {
          const randomIndex = Math.floor(Math.random() * question.options.length);
          return question.options[randomIndex];
        }
        return 'Resposta padrão';
      
      case 'multiple_choice':
        // Escolher múltiplas opções
        if (question.options && question.options.length > 0) {
          const numChoices = Math.floor(Math.random() * Math.min(3, question.options.length)) + 1;
          const shuffled = [...question.options].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, numChoices);
        }
        return ['Resposta padrão'];
      
      case 'text':
        return `Resposta de texto simulada para: ${question.text}`;
      
      case 'number':
        return Math.floor(Math.random() * 100) + 1;
      
      default:
        return 'Resposta padrão';
    }
  }

  /**
   * Enviar resposta para uma questão
   */
  async submitAnswer(submittedFormId: string, questionId: string, answer: any): Promise<TestResult> {
    try {
      console.log(`💾 [FormsTester] Enviando resposta para questão ${questionId}...`);
      
      const response = await axios.post(`${this.config.baseUrl}/answers`, {
        submittedFormId,
        questionId,
        answer
      }, {
        headers: this.getAuthHeaders()
      });

      console.log(`✅ [FormsTester] Resposta enviada com sucesso`);
      
      return {
        success: true,
        message: 'Resposta enviada com sucesso',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro ao enviar resposta:', error.message);
      return {
        success: false,
        message: 'Erro ao enviar resposta',
        error: error.message
      };
    }
  }

  /**
   * Completar formulário
   */
  async completeForm(submittedFormId: string): Promise<TestResult> {
    try {
      console.log(`✅ [FormsTester] Completando formulário ${submittedFormId}...`);
      
      const response = await axios.patch(`${this.config.baseUrl}/submitted-forms/${submittedFormId}`, {
        status: 'completed',
        completedAt: new Date().toISOString()
      }, {
        headers: this.getAuthHeaders()
      });

      console.log(`✅ [FormsTester] Formulário completado com sucesso`);
      
      return {
        success: true,
        message: 'Formulário completado com sucesso',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro ao completar formulário:', error.message);
      return {
        success: false,
        message: 'Erro ao completar formulário',
        error: error.message
      };
    }
  }

  /**
   * Testar formulário completo
   */
  async testForm(formId: string): Promise<TestResult> {
    try {
      console.log(`🧪 [FormsTester] Iniciando teste do formulário ${formId}...`);
      
      // 1. Buscar formulário com questões
      const formResult = await this.getFormWithQuestions(formId);
      if (!formResult.success) {
        return formResult;
      }

      const formData = formResult.data as FormData;
      
      // 2. Criar submitted form
      const submittedFormResult = await this.createSubmittedForm(formId);
      if (!submittedFormResult.success) {
        return submittedFormResult;
      }

      const submittedForm = submittedFormResult.data;
      
      // 3. Responder todas as questões
      console.log(`📝 [FormsTester] Respondendo ${formData.questions.length} questões...`);
      
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i];
        const answer = this.generateSimulatedAnswer(question);
        
        console.log(`   ${i + 1}/${formData.questions.length}: ${question.text.substring(0, 50)}...`);
        
        const answerResult = await this.submitAnswer(submittedForm.id, question.id, answer);
        if (!answerResult.success) {
          console.error(`❌ [FormsTester] Erro na questão ${i + 1}:`, answerResult.message);
          return answerResult;
        }
        
        // Pequena pausa entre respostas para simular tempo real
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 4. Completar formulário
      const completeResult = await this.completeForm(submittedForm.id);
      if (!completeResult.success) {
        return completeResult;
      }
      
      console.log(`🎉 [FormsTester] Teste do formulário ${formId} concluído com sucesso!`);
      
      return {
        success: true,
        message: `Formulário ${formId} testado com sucesso`,
        data: {
          formId,
          submittedFormId: submittedForm.id,
          questionsAnswered: formData.questions.length
        }
      };
      
    } catch (error: any) {
      console.error('❌ [FormsTester] Erro no teste do formulário:', error.message);
      return {
        success: false,
        message: 'Erro no teste do formulário',
        error: error.message
      };
    }
  }

  /**
   * Testar múltiplos formulários
   */
  async testMultipleForms(formIds: string[]): Promise<TestResult[]> {
    console.log(`🧪 [FormsTester] Iniciando teste de ${formIds.length} formulários...`);
    
    const results: TestResult[] = [];
    
    for (let i = 0; i < formIds.length; i++) {
      const formId = formIds[i];
      console.log(`\n📋 [FormsTester] Testando formulário ${i + 1}/${formIds.length}: ${formId}`);
      
      const result = await this.testForm(formId);
      results.push(result);
      
      if (!result.success) {
        console.error(`❌ [FormsTester] Falha no formulário ${formId}:`, result.message);
      } else {
        console.log(`✅ [FormsTester] Formulário ${formId} testado com sucesso`);
      }
      
      // Pausa entre formulários
      if (i < formIds.length - 1) {
        console.log('⏳ [FormsTester] Aguardando 2 segundos antes do próximo formulário...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 [FormsTester] Resumo: ${successCount}/${formIds.length} formulários testados com sucesso`);
    
    return results;
  }

  /**
   * Gerar headers de autenticação
   */
  private getAuthHeaders() {
    return this.authToken ? {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }
}

/**
 * Função principal para executar os testes
 */
async function runFormsTest() {
  console.log('🚀 [FormsTester] Iniciando testes de formulários...\n');
  
  // Configuração
  const config: TestConfig = {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8080/api',
    testUserId: process.env.TEST_USER_ID,
    testOrganizationId: process.env.TEST_ORGANIZATION_ID
  };
  
  const tester = new FormsTester(config);
  
  try {
    // 1. Autenticar
    const authResult = await tester.authenticate();
    if (!authResult.success) {
      console.error('❌ Falha na autenticação. Encerrando testes.');
      process.exit(1);
    }
    
    // 2. Buscar formulários disponíveis
    const formsResult = await tester.getForms();
    if (!formsResult.success) {
      console.error('❌ Falha ao buscar formulários. Encerrando testes.');
      process.exit(1);
    }
    
    const forms = formsResult.data as any[];
    console.log(`📋 [FormsTester] Formulários encontrados:`);
    forms.forEach((form, index) => {
      console.log(`   ${index + 1}. ${form.title} (${form.id})`);
    });
    
    // 3. Testar formulários específicos ou todos
    const formsToTest = process.argv.slice(2); // IDs dos formulários via linha de comando
    
    let formIds: string[];
    if (formsToTest.length > 0) {
      formIds = formsToTest;
      console.log(`\n🎯 [FormsTester] Testando formulários específicos: ${formIds.join(', ')}`);
    } else {
      // Testar os primeiros 3 formulários por padrão
      formIds = forms.slice(0, 3).map(f => f.id);
      console.log(`\n🎯 [FormsTester] Testando primeiros 3 formulários por padrão`);
    }
    
    // 4. Executar testes
    const results = await tester.testMultipleForms(formIds);
    
    // 5. Relatório final
    console.log('\n📊 [FormsTester] RELATÓRIO FINAL:');
    console.log('=' .repeat(50));
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Falhas: ${failCount}`);
    console.log(`📈 Taxa de sucesso: ${((successCount / results.length) * 100).toFixed(1)}%`);
    
    if (failCount > 0) {
      console.log('\n❌ Formulários com falha:');
      results.forEach((result, index) => {
        if (!result.success) {
          console.log(`   - Formulário ${index + 1}: ${result.message}`);
        }
      });
    }
    
    console.log('\n🎉 [FormsTester] Testes concluídos!');
    
  } catch (error: any) {
    console.error('❌ [FormsTester] Erro crítico:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runFormsTest().catch(console.error);
}

export { FormsTester, runFormsTest };
