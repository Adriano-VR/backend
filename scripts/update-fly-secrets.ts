#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// 🎯 Script para atualizar secrets do Fly com variáveis do Supabase
console.log('🚀 Iniciando atualização dos secrets do Fly...');

// Carrega as variáveis do arquivo .env
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  process.exit(1);
}

dotenv.config({ path: envPath });

// 📋 Lista de variáveis do Supabase que precisam ser atualizadas
const supabaseSecrets = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'SENDGRID_API_KEY',
  'ALLOWED_ORIGINS',
  'PORT'
];

// 🎯 Função para executar comandos do Fly
function runFlyCommand(command: string, appName: string): void {
  try {
    console.log(`🔧 Executando: ${command} para ${appName}`);
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ Sucesso: ${result.trim()}`);
  } catch (error) {
    console.error(`❌ Erro ao executar comando: ${error}`);
    throw error;
  }
}

// 🎯 Função para atualizar secrets de uma aplicação
function updateAppSecrets(appName: string): void {
  console.log(`\n🎯 Atualizando secrets para: ${appName}`);
  
  // Constrói o comando para definir todos os secrets
  const secretsCommand = supabaseSecrets
    .map(secret => {
      const value = process.env[secret];
      if (!value) {
        console.warn(`⚠️  Variável ${secret} não encontrada no .env`);
        return null;
      }
      return `${secret}=${value}`;
    })
    .filter(Boolean)
    .join(' ');

  if (secretsCommand) {
    const flyCommand = `fly secrets set ${secretsCommand} --app ${appName}`;
    runFlyCommand(flyCommand, appName);
  }
}

// 🎯 Função principal
async function main() {
  try {
    console.log('📋 Variáveis do Supabase encontradas:');
    supabaseSecrets.forEach(secret => {
      const value = process.env[secret];
      if (value) {
        console.log(`  ✅ ${secret}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`  ❌ ${secret}: não encontrada`);
      }
    });

    // 🚀 Atualiza secrets para produção
    console.log('\n🎯 Atualizando secrets de PRODUÇÃO...');
    updateAppSecrets('mentesegura-backend');

    // 🚀 Atualiza secrets para staging
    console.log('\n🎯 Atualizando secrets de STAGING...');
    updateAppSecrets('mentesegura-backend-staging');

    console.log('\n🎉 Todos os secrets foram atualizados com sucesso!');
    console.log('🔍 Para verificar, execute: fly secrets list --app mentesegura-backend');
    console.log('🔍 Para verificar staging: fly secrets list --app mentesegura-backend-staging');

  } catch (error) {
    console.error('💥 Erro durante a atualização:', error);
    process.exit(1);
  }
}

// 🚀 Executa o script
main().catch(console.error);
