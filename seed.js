#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Executando seed do formulário com grupos...\n');

try {
    // 1. Regenerar Prisma Client
    console.log('🔧 Regenerando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client regenerado!\n');

    // 2. Sincronizar banco
    console.log('🔍 Sincronizando banco...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Banco sincronizado!\n');

    // 3. Executar seed
    console.log('🚀 Executando seed do formulário com grupos...');
    execSync('npx ts-node prisma/seeds/basic/templates-forms/form-middle-with-groups-seed.ts', { stdio: 'inherit' });
    console.log('✅ Seed executado com sucesso!\n');

    console.log('🎉 Tudo concluído! O formulário com grupos foi criado.');
    console.log('📊 Você pode verificar no banco usando: npx prisma studio');

} catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    process.exit(1);
} 