const { execSync } = require('child_process');

console.log('🚀 Executando seed dos templates com grupos...');

try {
  // Gerar Prisma Client
  console.log('📦 Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Fazer push do schema
  console.log('🗄️ Fazendo push do schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Executar o seed dos templates
  console.log('🌱 Executando seed dos templates...');
  execSync('npx ts-node prisma/seeds/basic/templates-forms/template-forms-seed.ts', { stdio: 'inherit' });
  
  console.log('✅ Seed dos templates executado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao executar seed:', error.message);
  process.exit(1);
} 