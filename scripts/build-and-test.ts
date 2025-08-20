#!/usr/bin/env tsx

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🔨 Iniciando build e teste do backend...'));

try {
  // Limpar dist
  console.log(chalk.yellow('🧹 Limpando dist...'));
  execSync('rm -rf dist', { stdio: 'inherit' });

  // Gerar Prisma client
  console.log(chalk.yellow('🔧 Gerando Prisma client...'));
  execSync('pnpm prisma generate', { stdio: 'inherit' });

  // Build da aplicação
  console.log(chalk.yellow('🏗️ Fazendo build...'));
  execSync('pnpm run build', { stdio: 'inherit' });

  // Verificar se o arquivo main.js foi gerado
  console.log(chalk.yellow('✅ Verificando arquivos gerados...'));
  execSync('ls -la dist/', { stdio: 'inherit' });

  console.log(chalk.green('🎉 Build concluído com sucesso!'));
  console.log(chalk.cyan('💡 Para testar localmente: pnpm run start'));

} catch (error) {
  console.error(chalk.red('❌ Erro durante o build:'), error);
  process.exit(1);
}

