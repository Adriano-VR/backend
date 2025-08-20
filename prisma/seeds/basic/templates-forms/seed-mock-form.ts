#!/usr/bin/env tsx

import { PrismaClient, QuestionType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 📋 Interface para o formulário mock (padrão psicológico)
interface MockFormField {
  codigo: string;
  categoria: string;
  label: string;
  tipo: string;
  opcoes: any[];
  obrigatorio: boolean;
  fonte?: string;
}

interface MockForm {
  slug: string;
  id: string;
  titulo: string;
  descricao: string;
  instrucoes: string;
  tipo: string;
  questions: MockFormField[];
}

// 🔧 Funções utilitárias
function convertQuestionType(type: string): QuestionType {
  const typeMapping: { [key: string]: QuestionType } = {
    radio: QuestionType.scale_frequency,
    scale_frequency: QuestionType.scale_frequency,
    scale_intensity: QuestionType.scale_intensity,
    qualitative: QuestionType.qualitative,
    multiple_choice: QuestionType.multiple_choice,
    text: QuestionType.text,
    number: QuestionType.number,
  };

  return typeMapping[type] || QuestionType.scale_frequency;
}

function formatOptions(options: any[]): any {
  if (!options || options.length === 0) return null;
  
  // Se já está no formato novo com value e label, retorna como está
  if (
    options.length > 0 &&
    typeof options[0] === 'object' &&
    options[0].hasOwnProperty('value')
  ) {
    return options;
  }
  
  // Se está no formato antigo (array de strings), converte
  return options.map((opt, index) => ({
    value: index + 1,
    label: opt
  }));
}

// 🌱 Função para criar grupo de questões padrão para o formulário mock
async function createMockQuestionGroup(): Promise<any> {
  const group = await prisma.questionGroup.create({
    data: {
      name: 'Questões de Teste',
      label: 'Questões de Teste',
      slug: 'form_mock_001-questoes-teste',
      order: 1,
      meta: {
        description: 'Grupo para questões do formulário de teste mock',
        color: '#6C7B7F',
        icon: 'test',
        type: 'mock',
      },
    },
  });
  
  console.log(`✅ Grupo de questões criado: ${group.name} (ID: ${group.id})`);
  return group;
}

// 🌱 Função principal para adicionar o formulário mock
async function seedMockForm(): Promise<void> {
  console.log('🌱 [Mock Form Seed] Iniciando seed do formulário mock...\n');

  try {
    // 📁 Caminho para o arquivo JSON do formulário mock
    const mockFormPath = path.join(__dirname, 'form-mock.json');
    
    if (!fs.existsSync(mockFormPath)) {
      throw new Error(`Arquivo não encontrado: ${mockFormPath}`);
    }

    // 📖 Ler e parsear o arquivo JSON
    const fileContent = fs.readFileSync(mockFormPath, 'utf-8');
    const formData: MockForm = JSON.parse(fileContent);

    const title = formData.titulo;
    const description = formData.descricao;
    const instructions = formData.instrucoes;

    console.log(`📝 Processando formulário: ${title}`);
    console.log(`📋 Número de questões: ${formData.questions.length}`);

    // 🔍 Verificar se já existe um formulário com este slug
    const existingForm = await prisma.form.findFirst({
      where: {
        slug: formData.slug,
        isTemplate: true,
      },
    });

    if (existingForm) {
      console.log(`🔄 Formulário existente encontrado: ${existingForm.title} (ID: ${existingForm.id})`);
      
      // Verificar se o formulário tem questões
      const existingQuestions = await prisma.formQuestion.count({
        where: { formId: existingForm.id }
      });
      
      if (existingQuestions > 0) {
        console.log(`✅ Formulário já tem ${existingQuestions} questões, removendo para recriar...`);
        
        // Remover questões existentes
        await prisma.formQuestion.deleteMany({
          where: { formId: existingForm.id },
        });
        
        // Remover formulário
        await prisma.form.delete({
          where: { id: existingForm.id },
        });
        
        console.log(`✅ Formulário existente removido`);
      }
    }

    // 🆕 Criar formulário
    const form = await prisma.form.create({
      data: {
        slug: formData.slug,
        title: title,
        description: description,
        instructions: instructions,
        isTemplate: true,
        qualityDiagnosis: 'mock',
      },
    });

    console.log(`✅ Formulário criado: ${form.title} (ID: ${form.id})`);

    // 🏷️ Criar grupo de questões
    const questionGroup = await createMockQuestionGroup();

    // ❓ Criar questões e vinculá-las ao formulário
    let questionsCreated = 0;
    
    console.log(`🔧 Criando ${formData.questions.length} questões...`);
    
    for (const [index, fieldData] of formData.questions.entries()) {
      try {
        const question = await prisma.question.create({
          data: {
            code: fieldData.codigo,
            level: 'MOCK',
            dimension: fieldData.categoria,
            text: fieldData.label,
            type: convertQuestionType(fieldData.tipo),
            options: formatOptions(fieldData.opcoes),
            questionGroupId: questionGroup.id,
          },
        });

        await prisma.formQuestion.create({
          data: {
            formId: form.id,
            questionId: question.id,
            order: index + 1,
            required: fieldData.obrigatorio,
            hidden: false,
          },
        });
        
        questionsCreated++;
        console.log(`  ✅ Questão ${fieldData.codigo} criada`);
      } catch (error) {
        console.error(`❌ Erro ao criar questão ${fieldData.codigo}:`, error);
      }
    }

    console.log(`\n🎉 Formulário mock criado com sucesso!`);
    console.log(`📊 Resumo:`);
    console.log(`   - Formulário: ${form.title}`);
    console.log(`   - Slug: ${form.slug}`);
    console.log(`   - Questões criadas: ${questionsCreated}/${formData.questions.length}`);
    console.log(`   - Grupo: ${questionGroup.name}`);

  } catch (error: any) {
    console.error('❌ [Mock Form Seed] Erro:', error.message || error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 🚀 Executar se chamado diretamente
if (require.main === module) {
  seedMockForm().catch((e) => {
    console.error('❌ [Mock Form Seed] Erro crítico:', e);
    process.exit(1);
  });
}

export default seedMockForm;
