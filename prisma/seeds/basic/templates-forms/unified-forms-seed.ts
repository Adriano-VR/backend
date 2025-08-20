import { PrismaClient, QuestionType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 📋 Interface para formulários do formato Core (COPSOQ, Mock, QS)
interface CoreFormQuestion {
  id: string;
  code: string;
  dimension: string;
  comment?: string;
  level: string;
  text: string;
  type: string;
  options: any[] | null;
}

interface CoreForm {
  slug: string;
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  questions: CoreFormQuestion[];
}

// 📋 Interface para formulários do formato Psicológico (DASS, WHO5)
interface PsychFormField {
  codigo: string;
  categoria: string;
  label: string;
  tipo: string;
  opcoes: any[];
  obrigatorio: boolean;
  fonte?: string;
}

interface PsychForm {
  slug: string;
  id: string;
  title?: string;       // Para DASS21
  titulo?: string;      // Para WHO5
  description?: string; // Para DASS21
  descricao?: string;   // Para WHO5
  instructions?: string; // Para DASS21
  instrucoes?: string;   // Para WHO5
  tipo?: string;
  questions?: PsychFormField[];
  campos?: PsychFormField[];
}

// 📋 Interface para grupos de questões
interface QuestionGroup {
  name: string;
  label: string;
  slug: string;
  meta: {
    description: string;
    color?: string;
    icon?: string;
  };
  order: number;
}

interface QuestionGroupsData {
  questionGroups: QuestionGroup[];
}

// 🔧 Funções utilitárias
function formatOptions(options: any[]): any {
  if (!options || options.length === 0) return { opt: [] };
  
  // Se já está no formato novo com value e label, retorna como está
  if (
    options.length > 0 &&
    typeof options[0] === 'object' &&
    options[0].hasOwnProperty('value')
  ) {
    return options;
  }
  
  // Se está no formato antigo (array de strings), converte
  return { opt: options };
}

function convertQuestionType(type: string): QuestionType {
  const typeMapping: { [key: string]: QuestionType } = {
    scale_frequency: QuestionType.scale_frequency,
    scale_intensity: QuestionType.scale_intensity,
    qualitative: QuestionType.qualitative,
    radio: QuestionType.scale_frequency,
    multiple_choice: QuestionType.multiple_choice,
    text: QuestionType.text,
    number: QuestionType.number,
  };

  return typeMapping[type] || QuestionType.scale_frequency;
}

// 🔍 Função para carregar grupos de questões de arquivo JSON
function loadQuestionGroups(formSlug: string): QuestionGroup[] | null {
  const questionGroupsDir = path.join(__dirname, '..', 'question_groups');
  
  // Mapear slugs para arquivos de grupos
  const groupFiles: { [key: string]: string } = {
    'form_dass21': 'question_group_dass21.json',
    'form_qs': 'question_group_qs.json',
    'form_copsoq_core': 'question_group_copsoq.json',
    'form_copsoq_middle': 'question_group_copsoq.json',
    'form_copsoq_long': 'question_group_copsoq.json',
  };
  
  const groupFile = groupFiles[formSlug];
  if (!groupFile) {
    return null;
  }
  
  const filePath = path.join(questionGroupsDir, groupFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Arquivo de grupos não encontrado: ${filePath}`);
    return null;
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: QuestionGroupsData = JSON.parse(fileContent);
    return data.questionGroups;
  } catch (error) {
    console.error(`❌ Erro ao carregar grupos de questões de ${filePath}:`, error);
    return null;
  }
}


// 🔍 Função para mapear dimensões para grupos específicos do formulário QS
function mapDimensionToGroup(dimension: string, formSlug: string): string | null {
  if (formSlug === 'form_qs') {
    const dimensionMapping: { [key: string]: string } = {
      'Grupo 1': 'Autoconhecimento e identidade espiritual',
      'Grupo 2': 'Propósito e conexão divina',
      'Grupo 3': 'Desenvolvimento e crescimento espiritual',
      'Grupo 4': 'Serviço ao próximo e práticas espirituais',
    };
    return dimensionMapping[dimension] || null;
  }
  return null;
}

// 🌱 Função para criar grupos de questões padrão
async function createDefaultQuestionGroup(formSlug: string, formTitle: string): Promise<any> {
  const group = await (prisma as any).questionGroup.create({
    data: {
      name: `Questões Gerais - ${formTitle}`,
      label: `Questões Gerais`,
      slug: `${formSlug}-questoes-gerais`,
      order: 1,
      meta: {
        description: `Grupo padrão para todas as questões do formulário ${formTitle}`,
        color: '#6C7B7F',
        icon: 'default',
        type: 'default',
      },
    },
  });
  
  console.log(`✅ Grupo padrão criado: ${group.name} (ID: ${group.id})`);
  return group;
}

// 🌱 Função para criar grupos de questões predefinidos
async function createPredefinedQuestionGroups(groups: QuestionGroup[]): Promise<Map<string, any>> {
  const createdGroups = new Map<string, any>();
  
  console.log(`📊 Verificando/criando ${groups.length} grupos predefinidos...`);
  
  for (const groupData of groups) {
    try {
      // Verificar se o grupo já existe pelo slug
      let group = await (prisma as any).questionGroup.findFirst({
        where: { slug: groupData.slug }
      });
      
      if (group) {
        console.log(`♻️ Grupo já existe: ${group.name} (ID: ${group.id})`);
      } else {
        // Criar o grupo se não existir
        group = await (prisma as any).questionGroup.create({
          data: {
            name: groupData.name,
            label: groupData.label,
            slug: groupData.slug,
            order: groupData.order,
            meta: groupData.meta,
          },
        });
        console.log(`✅ Grupo criado: ${group.name} (ID: ${group.id})`);
      }
      
      createdGroups.set(groupData.name, group);
    } catch (error) {
      console.error(`❌ Erro ao processar grupo ${groupData.name}:`, error);
      throw error;
    }
  }
  
  return createdGroups;
}

// 🌱 Função para processar formulários do formato Core COM grupos obrigatórios
async function seedCoreFormatForm(filePath: string): Promise<void> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const formData: CoreForm = JSON.parse(fileContent);

  console.log(`📝 Processando formulário Core: ${formData.title}`);
  console.log(`🔍 Instructions: ${formData.instructions ? 'PRESENTE' : 'AUSENTE'}`);
  console.log(`📋 Número de questões: ${formData.questions.length}`);

  // Verificar se já existe um formulário com este slug
  const existingForm = await prisma.form.findFirst({
    where: {
      slug: formData.slug,
      isTemplate: true,
    },
  });

  if (existingForm) {
    console.log(`🔄 Formulário existente encontrado: ${existingForm.title} (ID: ${existingForm.id})`);
    
    // Verificar se o formulário tem questões com grupos
    const questionsWithGroups = await prisma.question.count({
      where: {
        formQuestion: {
          some: {
            formId: existingForm.id
          }
        },
        questionGroupId: {
          not: null
        }
      }
    });
    
    const totalQuestions = await prisma.formQuestion.count({
      where: { formId: existingForm.id }
    });
    
    if (questionsWithGroups === totalQuestions && totalQuestions > 0) {
      console.log(`✅ Formulário já tem TODOS os grupos (${questionsWithGroups}/${totalQuestions}), pulando...`);
      return;
    } else {
      console.log(`🗑️ Formulário SEM grupos completos (${questionsWithGroups}/${totalQuestions}), removendo para recriar...`);
      
      // Remover formulário existente e suas questões
      await prisma.formQuestion.deleteMany({
        where: { formId: existingForm.id },
      });
      
      await prisma.form.delete({
        where: { id: existingForm.id },
      });
      
      console.log(`✅ Formulário existente removido`);
    }
  }

  // Criar formulário
  const form = await prisma.form.create({
    data: {
      slug: formData.slug,
      title: formData.title,
      description: formData.description || `Template do formulário ${formData.title}`,
      instructions: formData.instructions || null,
      isTemplate: true,
      qualityDiagnosis: 'default',
    },
  });

  console.log(`✅ Formulário criado: ${form.title} (ID: ${form.id})`);

  // Tentar carregar grupos predefinidos
  const predefinedGroups = loadQuestionGroups(formData.slug);
  let questionGroups: Map<string, any>;
  
  if (predefinedGroups) {
    // Usar grupos predefinidos
    console.log(`📚 Usando grupos predefinidos para ${formData.slug}`);
    questionGroups = await createPredefinedQuestionGroups(predefinedGroups);
  } else {
    // Criar grupos baseados nas dimensões únicas
    console.log(`🔧 Criando grupos baseados nas dimensões para ${formData.slug}`);
    const uniqueDimensions = [...new Set(formData.questions.map((q) => q.dimension))];
    questionGroups = new Map<string, any>();
    
    if (uniqueDimensions.length === 1) {
      // Se há apenas uma dimensão, criar um grupo padrão
      const defaultGroup = await createDefaultQuestionGroup(formData.slug, formData.title);
      questionGroups.set(uniqueDimensions[0], defaultGroup);
    } else {
      // Criar grupos para cada dimensão
      for (const [index, dimension] of uniqueDimensions.entries()) {
        const group = await (prisma as any).questionGroup.create({
          data: {
            name: dimension,
            label: dimension,
            slug: `${formData.slug}-${dimension.toLowerCase().replace(/\s+/g, '-')}`,
            order: index + 1,
            meta: {
              description: `Grupo de questões relacionadas à dimensão: ${dimension}`,
              level: formData.questions[0]?.level || 'CORE',
              color: '#6C7B7F',
              icon: 'default',
            },
          },
        });
        questionGroups.set(dimension, group);
        console.log(`✅ Grupo criado: ${dimension} (ID: ${group.id})`);
      }
    }
  }

  // Criar questões e vinculá-las aos grupos
  let questionOrder = 0;
  let questionsCreated = 0;
  
  console.log(`🔧 Iniciando criação de ${formData.questions.length} questões...`);
  
  for (const questionData of formData.questions) {
    let group: any;
    
    if (predefinedGroups) {
      // Para grupos predefinidos, mapear por nome/dimensão
      // Primeiro tentar mapeamento específico do formulário
      const mappedGroupName = mapDimensionToGroup(questionData.dimension, formData.slug);
      
      if (mappedGroupName) {
        // Usar mapeamento específico
        group = Array.from(questionGroups.values()).find(g => g.name === mappedGroupName);
        console.log(`🔗 Mapeamento específico: "${questionData.dimension}" -> "${mappedGroupName}"`);
      } else {
        // Buscar grupo que corresponde à dimensão da questão
        group = Array.from(questionGroups.values()).find(g => 
          g.name === questionData.dimension || 
          g.label === questionData.dimension ||
          g.slug === questionData.dimension?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        );
      }
      
      // Fallback: se não encontrar, usar o primeiro grupo
      if (!group) {
        console.warn(`⚠️ Grupo específico não encontrado para dimensão: "${questionData.dimension}", usando primeiro disponível`);
        group = Array.from(questionGroups.values())[0];
      }
    } else {
      group = questionGroups.get(questionData.dimension);
    }
    
    if (!group) {
      console.warn(`⚠️ Nenhum grupo encontrado para dimensão: ${questionData.dimension}`);
      continue;
    }

    try {
      const question = await prisma.question.create({
        data: {
          code: questionData.code,
          level: questionData.level,
          dimension: questionData.dimension,
          comment: questionData.comment || null,
          text: questionData.text,
          type: convertQuestionType(questionData.type),
          options: formatOptions(questionData.options || []),
          questionGroupId: group.id, // Vincular questão ao grupo SEMPRE
        } as any,
      });

      await prisma.formQuestion.create({
        data: {
          formId: form.id,
          questionId: question.id,
          order: questionOrder++,
          required: true,
          hidden: false,
        },
      });
      
      questionsCreated++;
    } catch (error) {
      console.error(`❌ Erro ao criar questão ${questionData.code}:`, error);
    }
  }

  console.log(`✅ ${questionsCreated} questões criadas e vinculadas ao formulário ${form.title}`);
}

// 🌱 Função para processar formulários do formato Psicológico COM grupos obrigatórios
async function seedPsychFormatForm(filePath: string): Promise<void> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const formData: PsychForm = JSON.parse(fileContent);

  const title = formData.title || formData.titulo || 'Formulário Psicológico';
  const description = formData.description || formData.descricao || '';
  const instructions = formData.instructions || formData.instrucoes;
  const fields = formData.questions || formData.campos || [];

  console.log(`📝 Processando formulário Psicológico: ${title}`);
  console.log(`🔍 Instructions: ${instructions ? 'PRESENTE' : 'AUSENTE'}`);
  console.log(`📊 Número de questões: ${fields.length}`);

  // Verificar se já existe um formulário com este slug
  const existingForm = await prisma.form.findFirst({
    where: {
      slug: formData.slug,
      isTemplate: true,
    },
  });

  if (existingForm) {
    console.log(`🔄 Formulário existente encontrado: ${existingForm.title} (ID: ${existingForm.id})`);
    
    // Verificar se o formulário tem questões com grupos
    const questionsWithGroups = await prisma.question.count({
      where: {
        formQuestion: {
          some: {
            formId: existingForm.id
          }
        },
        questionGroupId: {
          not: null
        }
      }
    });
    
    const totalQuestions = await prisma.formQuestion.count({
      where: { formId: existingForm.id }
    });
    
    if (questionsWithGroups === totalQuestions && totalQuestions > 0) {
      console.log(`✅ Formulário já tem TODOS os grupos (${questionsWithGroups}/${totalQuestions}), pulando...`);
      return;
    } else {
      console.log(`🗑️ Formulário SEM grupos completos (${questionsWithGroups}/${totalQuestions}), removendo para recriar...`);
      
      // Remover formulário existente e suas questões
      await prisma.formQuestion.deleteMany({
        where: { formId: existingForm.id },
      });
      
      await prisma.form.delete({
        where: { id: existingForm.id },
      });
      
      console.log(`✅ Formulário existente removido`);
    }
  }

  // Criar formulário
  const form = await prisma.form.create({
    data: {
      slug: formData.slug,
      title: title,
      description: description,
      instructions: instructions || null,
      isTemplate: true,
      qualityDiagnosis: 'default',
    },
  });

  console.log(`✅ Formulário criado: ${form.title} (ID: ${form.id})`);

  // Tentar carregar grupos predefinidos
  const predefinedGroups = loadQuestionGroups(formData.slug);
  let questionGroups: Map<string, any>;
  
  if (predefinedGroups) {
    // Usar grupos predefinidos
    console.log(`📚 Usando grupos predefinidos para ${formData.slug}`);
    questionGroups = await createPredefinedQuestionGroups(predefinedGroups);
  } else {
    // Verificar se todas as questões têm a mesma categoria
    const uniqueCategories = [...new Set(fields.map((c: PsychFormField) => c.categoria))];
    questionGroups = new Map<string, any>();
    
    if (uniqueCategories.length === 1) {
      // Criar um grupo padrão para categoria única
      const defaultGroup = await createDefaultQuestionGroup(formData.slug, title);
      questionGroups.set(uniqueCategories[0], defaultGroup);
    } else {
      // Criar grupos para cada categoria
      for (const [index, category] of uniqueCategories.entries()) {
        const group = await (prisma as any).questionGroup.create({
          data: {
            name: category,
            label: category,
            slug: `${formData.slug}-${category.toLowerCase().replace(/\s+/g, '-')}`,
            order: index + 1,
            meta: {
              description: `Grupo de questões relacionadas à categoria: ${category}`,
              level: formData.slug.split('_')[1]?.toUpperCase() || 'PSYCH',
              color: '#6C7B7F',
              icon: 'default',
            },
          },
        });
        questionGroups.set(category, group);
        console.log(`✅ Grupo criado: ${category} (ID: ${group.id})`);
      }
    }
  }

  // Criar questões e vinculá-las aos grupos
  let questionOrder = 0;
  let questionsCreated = 0;
  
  for (const fieldData of fields) {
    let group: any;
    
    if (predefinedGroups) {
      // Para grupos predefinidos, fazer mapeamento inteligente baseado na categoria
      const matchingGroup = Array.from(questionGroups.entries()).find(([groupName, _]) => 
        groupName.toLowerCase().includes(fieldData.categoria.toLowerCase()) ||
        fieldData.categoria.toLowerCase().includes(groupName.toLowerCase())
      );
      
      group = matchingGroup ? matchingGroup[1] : Array.from(questionGroups.values())[0];
    } else {
      group = questionGroups.get(fieldData.categoria);
    }
    
    if (!group) {
      console.warn(`⚠️ Grupo não encontrado para categoria: ${fieldData.categoria}`);
      continue;
    }

    try {
      const question = await prisma.question.create({
        data: {
          code: fieldData.codigo,
          level: formData.slug.split('_')[1]?.toUpperCase() || 'PSYCH',
          dimension: fieldData.categoria,
          text: fieldData.label,
          type: convertQuestionType(fieldData.tipo),
          options: formatOptions(fieldData.opcoes),
          questionGroupId: group.id, // Vincular questão ao grupo SEMPRE
        } as any,
      });

      await prisma.formQuestion.create({
        data: {
          formId: form.id,
          questionId: question.id,
          order: questionOrder++,
          required: fieldData.obrigatorio,
          hidden: false,
        },
      });
      
      questionsCreated++;
    } catch (error) {
      console.error(`❌ Erro ao criar questão ${fieldData.codigo}:`, error);
    }
  }

  console.log(`✅ ${questionsCreated} questões criadas e vinculadas ao formulário ${form.title}`);
}

// 🚀 Função principal para processar TODOS os templates COM grupos obrigatórios
async function seedAllFormsWithGroups(): Promise<void> {
  console.log('🌱 [Unified Forms Seed] Iniciando seed unificado de formulários COM grupos obrigatórios...\n');

  const formsDir = path.join(__dirname);

  try {
    // 📂 Lista de todos os formulários disponíveis
    const allForms = [
      // Formulários do formato Core
      { file: 'form_qs.json', type: 'core' },
      { file: 'form_dass21.json', type: 'core' },
      { file: 'form_copsoq_core.json', type: 'core' },
      { file: 'form_copsoq_middle.json', type: 'core' },
      { file: 'form_copsoq_long.json', type: 'core' },
      { file: 'form_who5.json', type: 'psych' },
    ];

    for (const formConfig of allForms) {
      const filePath = path.join(formsDir, formConfig.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Arquivo não encontrado: ${formConfig.file}`);
        continue;
      }
      
      console.log(`\n📁 Processando ${formConfig.file} (tipo: ${formConfig.type})`);
      console.log('='.repeat(80));
      
      try {
        if (formConfig.type === 'core') {
          await seedCoreFormatForm(filePath);
        } else if (formConfig.type === 'psych') {
          await seedPsychFormatForm(filePath);
        }
        
        console.log(`✅ ${formConfig.file} processado com sucesso!`);
      } catch (error) {
        console.error(`❌ Erro ao processar ${formConfig.file}:`, error);
        // Continua com o próximo arquivo
      }
      
      console.log('_'.repeat(80));
    }

    console.log('\n🎉 [Unified Forms Seed] Seed unificado concluído com sucesso!');
  } catch (error: any) {
    if (error.message?.includes('Unique constraint failed on the fields')) {
      console.log('🎉 [Unified Forms Seed] Seed já executado previamente!');
      return;
    }

    console.error('❌ Erro ao executar seed unificado dos formulários:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedAllFormsWithGroups();
  } catch (error: any) {
    console.error('❌ [Unified Forms Seed] Erro:', error.message || error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exporta a função para ser usada em outros seeds
export default seedAllFormsWithGroups;

// Executa apenas se o arquivo foi chamado diretamente
if (require.main === module) {
  main().catch((e) => {
    console.error('❌ [Unified Forms Seed] Erro crítico:', e);
    process.exit(1);
  });
}
