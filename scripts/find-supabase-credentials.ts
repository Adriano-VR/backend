/**
 * Script para te ajudar a encontrar as credenciais corretas do Supabase
 * Uso: pnpm ts-node scripts/find-supabase-credentials.ts
 */

console.log('🔍 [Guide] Como encontrar suas credenciais do Supabase:');
console.log('');

console.log('📍 1. Acesse: https://app.supabase.com/projects');
console.log('📍 2. Selecione seu projeto: loapkhztztcwboozwlyi');
console.log('');

console.log('🔑 3. Para encontrar a SERVICE_ROLE_KEY:');
console.log('   • Vá em: Settings > API');
console.log('   • Na seção "Project API keys"');
console.log('   • Copie a chave "service_role" (é secreta, use com cuidado!)');
console.log('');

console.log('🗄️ 4. Para encontrar a DATABASE_URL:');
console.log('   • Vá em: Settings > Database');
console.log('   • Na seção "Connection string"');
console.log('   • Copie a string completa que começa com "postgresql://postgres..."');
console.log('');

console.log('⚡ 5. Configuração rápida no .env:');
console.log('');
console.log('# Substitua estas linhas no seu .env:');
console.log('SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"');
console.log('DATABASE_URL="sua_connection_string_completa_aqui"');
console.log('DIRECT_URL="sua_connection_string_completa_aqui"');
console.log('');

console.log('💡 Dica: A connection string deve parecer com:');
console.log('postgresql://postgres.loapkhztztcwboozwlyi:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres');
console.log('');

console.log('🚀 Depois de configurar, teste com: pnpm start:dev');
console.log('');

console.log('❓ Sua configuração atual:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'NÃO CONFIGURADA');
console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...' || 'NÃO CONFIGURADA');
console.log('DATABASE_URL:', process.env.DATABASE_URL?.includes('SENHA_DO_BANCO') ? 'PRECISA DA SENHA REAL' : 'CONFIGURADA');
