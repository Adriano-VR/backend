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
    console.log('4. Executar seed de campanhas');
    console.log('5. Executar seed de notificações');
    console.log('');
    console.log('👥 SEEDS DE USUÁRIOS:');
    console.log('6. Usuários e organização demo');
    console.log('7. Respostas do formulário espiritual');
    console.log('');
    console.log('🧹 MANUTENÇÃO:');
    console.log('8. Limpar formulários duplicados');
    console.log('9. Verificar sincronização do banco');
    console.log('10. Regenerar Prisma Client');
    console.log('11. Limpar banco de dados');
    console.log('');
    console.log('0. Sair\n');

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Escolha uma opção (0-11): ', async (answer: string) => {
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
                console.log('\n🚀 Executando seed de campanhas...\n');
                const successCampaigns = runCommand(
                    'ts-node campaigns/campaign-seed.ts',
                    'Seed de campanhas'
                );
                if (successCampaigns) {
                    console.log('🎉 Seed de campanhas executado com sucesso!');
                }
                break;

            case '5':
                console.log('\n🚀 Executando seed de notificações...\n');
                const successNotifications = runCommand(
                    'ts-node run-notification-seed.ts',
                    'Seed de notificações'
                );
                if (successNotifications) {
                    console.log('🎉 Seed de notificações executado com sucesso!');
                }
                break;

            case '6':
                console.log('\n🚀 Executando usuários e organização demo...\n');
                const successUsers = runCommand(
                    'ts-node demos/default/seed-users-only.ts',
                    'Seed dos usuários e organização demo'
                );
                if (successUsers) {
                    console.log('🎉 Usuários e organização demo criados com sucesso!');
                }
                break;

            case '7':
                console.log('\n🚀 Executando respostas do formulário espiritual...\n');
                const successEspiritualResponses = runCommand(
                    'ts-node demos/default/seed-espiritual-responses.ts',
                    'Seed das respostas do formulário espiritual'
                );
                if (successEspiritualResponses) {
                    console.log('🎉 Respostas do formulário espiritual criadas com sucesso!');
                }
                break;

            case '8':
                console.log('\n🧹 Limpando formulários duplicados...\n');
                const successClean = runCommand(
                    'ts-node utils/clean-duplicate-forms.ts',
                    'Limpeza de formulários duplicados'
                );
                if (successClean) {
                    console.log('🎉 Formulários duplicados removidos com sucesso!');
                }
                break;

            case '9':
                console.log('\n🔍 Verificando sincronização do banco...\n');
                const successSync = runCommand(
                    'ts-node utils/check-db-sync.ts',
                    'Verificação de sincronização do banco'
                );
                if (successSync) {
                    console.log('🎉 Verificação de sincronização concluída!');
                }
                break;

            case '10':
                console.log('\n🔄 Regenerando Prisma Client...\n');
                const successPrisma = runCommand(
                    'cd ../../ && pnpm prisma generate',
                    'Regeneração do Prisma Client'
                );
                if (successPrisma) {
                    console.log('🎉 Prisma Client regenerado com sucesso!');
                }
                break;

            case '11':
                console.log('\n🗑️ Limpando banco de dados...\n');
                const successCleanDb = runCommand(
                    'cd ../../ && pnpm prisma db push --force-reset',
                    'Limpeza do banco de dados'
                );
                if (successCleanDb) {
                    console.log('🎉 Banco de dados limpo com sucesso!');
                }
                break;

            case '0':
                console.log('\n👋 Saindo...\n');
                rl.close();
                process.exit(0);
                break;

            default:
                console.log('\n❌ Opção inválida. Por favor, escolha uma opção válida.\n');
                break;
        }

        rl.close();
    });
}

// Executar a função principal
main().catch(console.error); 