/**
 * Script para testar as credenciais do Supabase
 * Uso: pnpm ts-node scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testSupabase() {
  console.log('🧪 [Test] Testando configuração do Supabase...');
  
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url) {
    console.error('❌ [Test] SUPABASE_URL não encontrada no .env');
    process.exit(1);
  }
  
  if (!serviceRoleKey || serviceRoleKey === 'your-supabase-service-role-key-here') {
    console.error('❌ [Test] SUPABASE_SERVICE_ROLE_KEY não configurada no .env');
    console.log('💡 [Test] Você precisa configurar a service role key do seu projeto Supabase');
    console.log('🔗 [Test] URL do projeto:', url);
    console.log('📋 [Test] Para encontrar sua service role key:');
    console.log('   1. Acesse https://app.supabase.com/projects');
    console.log('   2. Selecione seu projeto');
    console.log('   3. Vá em Settings > API');
    console.log('   4. Copie a "service_role" key (secreta)');
    process.exit(1);
  }
  
  console.log('🔑 [Test] URL encontrada:', url);
  console.log('🔑 [Test] Service key encontrada:', serviceRoleKey.substring(0, 20) + '...');
  
  try {
    // Criar cliente Supabase
    const supabase = createClient(url, serviceRoleKey);
    
    console.log('🔗 [Test] Testando conexão com Supabase Auth...');
    
    // Testar listagem de usuários (requer service role)
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.error('❌ [Test] Erro na conexão:', error);
      
      if (error.message?.includes('Invalid API key')) {
        console.error('🔐 [Test] Service role key inválida!');
      } else if (error.message?.includes('unauthorized')) {
        console.error('🚫 [Test] Não autorizado - verifique se é a service role key');
      }
      
      process.exit(1);
    }
    
    console.log('✅ [Test] Conexão com Supabase Auth bem-sucedida!');
    console.log('📊 [Test] Usuários encontrados:', data.users?.length || 0);
    
    // Testar connection string do database
    console.log('\n🗄️ [Test] Verificando connection string do banco...');
    
    // Extrair informações da URL do Supabase para montar a DATABASE_URL
    const projectRef = url.replace('https://', '').replace('.supabase.co', '');
    const databaseUrl = `postgresql://postgres.[PROJECT_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;
    
    console.log('💡 [Test] Sua DATABASE_URL deve ser algo como:');
    console.log(`   ${databaseUrl.replace('[PROJECT_PASSWORD]', '[SUA_SENHA_DO_BANCO]')}`);
    console.log('\n📋 [Test] Para encontrar a senha do banco:');
    console.log('   1. Acesse https://app.supabase.com/projects');
    console.log('   2. Selecione seu projeto');
    console.log('   3. Vá em Settings > Database');
    console.log('   4. Na seção "Connection string" copie a string completa');
    
  } catch (error: any) {
    console.error('❌ [Test] Erro inesperado:', error.message);
    process.exit(1);
  }
}

// Executar teste
testSupabase().catch(console.error);
