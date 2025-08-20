#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as readline from 'readline';
import * as path from 'path';

console.log('🗄️ Sistema de Atualização do Banco de Dados - MenteSegura\n');

interface ScriptOption {
    id: string;
    name: string;
    description: string;
    command: string;
    dangerous?: boolean;
    requiresConfirmation?: boolean;
}

// Configuração das opções de scripts organizados por categoria
const scriptCategories = {
    seeds: {
        title: '🌱 SEEDS BÁSICOS',
        options: [
            {
                id: 'seed-basic',
                name: 'Seed Básico (Templates)',
                description: 'Executa seed dos templates de formulários',
                command: 'pnpm seed:basic'
            },
            {
                id: 'seed-forms',
                name: 'Seed Formulários',
                description: 'Executa seed específico dos formulários',
                command: 'pnpm seed:forms'
            },
            {
                id: 'seed-courses',
                name: 'Seed Cursos',
                description: 'Executa seed dos cursos',
                command: 'pnpm seed:courses'
            }
        ]
    },
    demos: {
        title: '👥 SEEDS DE DEMONSTRAÇÃO',
        options: [
            {
                id: 'seed-demo',
                name: 'Seed Demo Padrão',
                description: 'Executa seed completo para demonstração',
                command: 'pnpm seed:demo'
            },
            {
                id: 'seed-detran',
                name: 'Seed Demo Detran',
                description: 'Executa seed específico para demo do Detran',
                command: 'pnpm seed:detran'
            },
            {
                id: 'seed-submitted-forms',
                name: 'Seed Formulários Submetidos',
                description: 'Executa seed de formulários já submetidos',
                command: 'pnpm seed:submitedForms'
            }
        ]
    },
    organizations: {
        title: '🏢 ORGANIZAÇÕES E FORMULÁRIOS',
        options: [
            {
                id: 'seed-org-forms',
                name: 'Formulários Organizacionais',
                description: 'Disponibiliza formulários para organizações',
                command: 'pnpm seed:orgForms'
            }
        ]
    },
    database: {
        title: '🔧 MANUTENÇÃO DO BANCO',
        options: [
            {
                id: 'prisma-push',
                name: 'Sincronizar Schema',
                description: 'Sincroniza o schema do Prisma com o banco',
                command: 'pnpm prisma:push'
            },
            {
                id: 'prisma-generate',
                name: 'Regenerar Client',
                description: 'Regenera o cliente Prisma',
                command: 'npx prisma generate'
            },
            {
                id: 'prisma-migrate',
                name: 'Executar Migrações',
                description: 'Executa migrações pendentes',
                command: 'npx prisma migrate dev'
            }
        ]
    },
    cleanup: {
        title: '🧹 LIMPEZA E RESET',
        options: [
            {
                id: 'delete-test-users',
                name: 'Limpar Usuários de Teste',
                description: 'Remove usuários de teste do Supabase',
                command: 'pnpm seed:deleteTestUsers'
            },
            {
                id: 'clear-db',
                name: 'Limpar Banco Completo',
                description: 'Reset completo do banco de dados',
                command: 'pnpm clear:db',
                dangerous: true,
                requiresConfirmation: true
            },
            {
                id: 'reset-full',
                name: 'Reset Completo + Seed',
                description: 'Reset total com migrações e seed básico',
                command: 'pnpm reset:full',
                dangerous: true,
                requiresConfirmation: true
            }
        ]
    }
};

// Função para executar comandos com feedback visual
function runCommand(command: string, description: string): boolean {
    console.log(`\n🔄 ${description}...`);
    console.log(`💻 Executando: ${command}\n`);
    
    try {
        execSync(command, { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            encoding: 'utf-8'
        });
        
        console.log(`\n✅ ${description} concluído com sucesso! 🎉\n`);
        return true;
    } catch (error: any) {
        console.error(`\n❌ Erro ao executar ${description.toLowerCase()}:`);
        console.error(`🐛 ${error.message || error}\n`);
        return false;
    }
}

// Função para criar interface readline
function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

// Função para perguntar confirmação
function askConfirmation(rl: readline.Interface, message: string): Promise<boolean> {
    return new Promise((resolve) => {
        rl.question(`⚠️ ${message} (s/N): `, (answer: string) => {
            const confirmed = answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim';
            resolve(confirmed);
        });
    });
}

// Função para exibir menu principal
function displayMainMenu() {
    console.log('📋 MENU PRINCIPAL - Escolha uma categoria:\n');
    
    let optionNumber = 1;
    const categoryMap: { [key: number]: string } = {};
    
    Object.entries(scriptCategories).forEach(([categoryKey, category]) => {
        console.log(`${optionNumber}. ${category.title}`);
        categoryMap[optionNumber] = categoryKey;
        optionNumber++;
    });
    
    console.log(`\n🔄 ${optionNumber}. Executar Múltiplos Scripts`);
    categoryMap[optionNumber] = 'multiple';
    optionNumber++;
    
    console.log(`0. 👋 Sair\n`);
    
    return categoryMap;
}

// Função para exibir menu de categoria
function displayCategoryMenu(categoryKey: string) {
    const category = scriptCategories[categoryKey as keyof typeof scriptCategories];
    
    console.log(`\n${category.title}:\n`);
    
    category.options.forEach((option, index) => {
        const dangerIcon = (option as any).dangerous ? '⚠️ ' : '';
        console.log(`${index + 1}. ${dangerIcon}${option.name}`);
        console.log(`   ${option.description}`);
        console.log('');
    });
    
    console.log('0. ⬅️ Voltar ao menu principal\n');
}

// Função para executar script com confirmação se necessário
async function executeScript(option: ScriptOption, rl: readline.Interface): Promise<void> {
    if ((option as any).requiresConfirmation) {
        const confirmed = await askConfirmation(
            rl,
            `Esta ação é IRREVERSÍVEL e pode apagar dados! Continuar?`
        );
        
        if (!confirmed) {
            console.log('❌ Operação cancelada pelo usuário.\n');
            return;
        }
    }
    
    const success = runCommand(option.command, option.name);
    
    if (success) {
        console.log(`🎊 ${option.name} executado com sucesso!\n`);
    } else {
        console.log(`💥 Falha na execução de ${option.name}.\n`);
    }
}

// Função para menu de múltiplos scripts
async function handleMultipleScripts(rl: readline.Interface): Promise<void> {
    console.log('\n🔄 EXECUÇÃO MÚLTIPLA - Escolha uma sequência:\n');
    
    const sequences = [
        {
            name: 'Setup Inicial Completo',
            description: 'Prisma push + Seed básico + Formulários org.',
            commands: ['pnpm prisma:push', 'pnpm seed:basic', 'pnpm seed:orgForms']
        },
        {
            name: 'Reset e Setup Demo',
            description: 'Reset + Seed básico + Demo padrão',
            commands: ['pnpm clear:db', 'pnpm seed:basic', 'pnpm seed:demo'],
            dangerous: true
        },
        {
            name: 'Atualização de Schema',
            description: 'Generate + Push + Migrate',
            commands: ['npx prisma generate', 'pnpm prisma:push', 'npx prisma migrate dev']
        }
    ];
    
    sequences.forEach((seq, index) => {
        const dangerIcon = (seq as any).dangerous ? '⚠️ ' : '';
        console.log(`${index + 1}. ${dangerIcon}${seq.name}`);
        console.log(`   ${seq.description}`);
        console.log('');
    });
    
    console.log('0. ⬅️ Voltar ao menu principal\n');
    
    const answer = await new Promise<string>((resolve) => {
        rl.question('Escolha uma sequência (0-3): ', resolve);
    });
    
    const choice = parseInt(answer.trim());
    
    if (choice === 0) return;
    
    const selectedSequence = sequences[choice - 1];
    if (!selectedSequence) {
        console.log('❌ Opção inválida!\n');
        return;
    }
    
    if ((selectedSequence as any).dangerous) {
        const confirmed = await askConfirmation(
            rl,
            'Esta sequência contém operações perigosas! Continuar?'
        );
        
        if (!confirmed) {
            console.log('❌ Operação cancelada pelo usuário.\n');
            return;
        }
    }
    
    console.log(`\n🚀 Executando sequência: ${selectedSequence.name}\n`);
    
    for (let i = 0; i < selectedSequence.commands.length; i++) {
        const command = selectedSequence.commands[i];
        console.log(`📍 Passo ${i + 1}/${selectedSequence.commands.length}:`);
        
        const success = runCommand(command, `Executando ${command}`);
        
        if (!success) {
            console.log(`❌ Falha no passo ${i + 1}. Abortando sequência.\n`);
            return;
        }
    }
    
    console.log(`🎉 Sequência "${selectedSequence.name}" concluída com sucesso!\n`);
}

// Função principal
async function main(): Promise<void> {
    const rl = createReadlineInterface();
    
    try {
        while (true) {
            const categoryMap = displayMainMenu();
            
            const mainAnswer = await new Promise<string>((resolve) => {
                rl.question('Escolha uma opção: ', resolve);
            });
            
            const mainChoice = parseInt(mainAnswer.trim());
            
            if (mainChoice === 0) {
                console.log('\n👋 Encerrando sistema de atualização do banco...');
                break;
            }
            
            const selectedCategory = categoryMap[mainChoice];
            
            if (!selectedCategory) {
                console.log('❌ Opção inválida!\n');
                continue;
            }
            
            if (selectedCategory === 'multiple') {
                await handleMultipleScripts(rl);
                continue;
            }
            
            // Menu da categoria
            while (true) {
                displayCategoryMenu(selectedCategory);
                
                const categoryAnswer = await new Promise<string>((resolve) => {
                    rl.question('Escolha uma opção: ', resolve);
                });
                
                const categoryChoice = parseInt(categoryAnswer.trim());
                
                if (categoryChoice === 0) {
                    break; // Volta ao menu principal
                }
                
                const category = scriptCategories[selectedCategory as keyof typeof scriptCategories];
                const selectedOption = category.options[categoryChoice - 1];
                
                if (!selectedOption) {
                    console.log('❌ Opção inválida!\n');
                    continue;
                }
                
                await executeScript(selectedOption, rl);
            }
        }
    } finally {
        rl.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Erro crítico no sistema:', error);
        process.exit(1);
    });
}

export default main;
