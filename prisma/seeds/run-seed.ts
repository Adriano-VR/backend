#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

console.log('🌱 Script para executar o seed do formulário com grupos\n');

// Função para executar comandos
function runCommand(command: string, description: string) {
    console.log(`🔄 ${description}...`);
    try {
        const result = execSync(command, { 
            cwd: __dirname, 
            stdio: 'inherit',
            encoding: 'utf-8'
        });
        console.log(`✅ ${description} concluído!\n`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao ${description.toLowerCase()}:`, error);
        return false;
    }
}

// Função principal
async function main() {
    console.log('📋 Opções disponíveis:');
    console.log('');
    console.log('🌱 SEEDS PRINCIPAIS:');
    console.log('1. Executar seed básico (templates)');
    console.log('2. Executar seed completo (demos)');
    console.log('3. Disponibilizar formulários para organizações');
    console.log('');
    console.log('👥 SEEDS DE USUÁRIOS:');
    console.log('4. Usuários e organização demo');
    console.log('5. Respostas do formulário espiritual');
    console.log('');
    console.log('🧹 MANUTENÇÃO:');
    console.log('6. Limpar formulários duplicados');
    console.log('7. Verificar sincronização do banco');
    console.log('8. Regenerar Prisma Client');
    console.log('9. Limpar banco de dados');
    console.log('');
    console.log('0. Sair\n');

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Escolha uma opção (0-9): ', async (answer: string) => {
        switch (answer.trim()) {
            case '1':
                console.log('\n🚀 Executando seed básico (templates)...\n');
                const success = runCommand(
                    'ts-node basic/seed.ts',
                    'Seed básico (templates)'
                );
                if (success) {
                    console.log('🎉 Seed básico executado com sucesso!');
                }
                break;

            case '2':
                console.log('\n🚀 Executando seed completo (demos)...\n');
                const successComplete = runCommand(
                    'ts-node demos/detran/main.ts',
                    'Seed completo (demos)'
                );
                if (successComplete) {
                    console.log('🎉 Seed completo executado com sucesso!');
                }
                break;

            case '3':
                console.log('\n🚀 Disponibilizando formulários para organizações...\n');
                const successOrgs = runCommand(
                    'ts-node utils/organizations-forms.ts',
                    'Disponibilizar formulários para organizações'
                );
                if (successOrgs) {
                    console.log('🎉 Formulários disponibilizados com sucesso!');
                }
                break;

            case '4':
                console.log('\n🚀 Executando usuários e organização demo...\n');
                const successUsers = runCommand(
                    'ts-node demos/default/seed-users-only.ts',
                    'Seed dos usuários e organização demo'
                );
                if (successUsers) {
                    console.log('🎉 Usuários e organização demo criados com sucesso!');
                }
                break;

            case '5':
                console.log('\n🚀 Executando respostas do formulário espiritual...\n');
                const successEspiritualResponses = runCommand(
                    'ts-node demos/default/seed-espiritual-responses.ts',
                    'Seed das respostas do formulário espiritual'
                );
                if (successEspiritualResponses) {
                    console.log('🎉 Respostas espirituais criadas com sucesso!');
                }
                break;

            case '6':
                console.log('\n🧹 Executando limpeza de formulários duplicados...\n');
                const successClean = runCommand(
                    'ts-node utils/clean-duplicate-forms.ts',
                    'Limpeza de formulários duplicados'
                );
                if (successClean) {
                    console.log('🎉 Limpeza concluída com sucesso!');
                }
                break;

        

            case '7':
                console.log('\n🔍 Verificando sincronização do banco...\n');
                runCommand(
                    'npx prisma db push',
                    'Sincronização do banco'
                );
                break;

            case '8':
                console.log('\n🔧 Regenerando Prisma Client...\n');
                runCommand(
                    'npx prisma generate',
                    'Geração do Prisma Client'
                );
                break;

            case '9':
                console.log('\n🗑️ Limpando banco de dados...\n');
                console.log('⚠️ ATENÇÃO: Esta ação irá apagar todos os dados do banco!');
                rl.question('Tem certeza que deseja continuar? (s/N): ', (confirm: string) => {
                    if (confirm.toLowerCase() === 's' || confirm.toLowerCase() === 'sim') {
                        runCommand(
                           "npx prisma migrate reset --force && npm run seed:deleteTestUsers",
                           'Limpeza do banco de dados'
                        );
                    } else {
                        console.log('❌ Operação cancelada pelo usuário.');
                    }
                    rl.close();
                });
                return; // Retorna para evitar fechar o readline antes da confirmação

        
            case '0':
                console.log('\n👋 Saindo...');
                rl.close();
                process.exit(0);
                break;

            default:
                console.log('\n❌ Opção inválida!');
                break;
        }

        rl.close();
    });
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

export default main; 