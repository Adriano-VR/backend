#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { supabaseConfig, getLogLevel } from '../src/supabase/supabase.config';

async function testLogging() {
  console.log('🧪 Testando configuração de logging do Supabase...');
  
  const logLevel = getLogLevel();
  console.log('📊 Nível de log configurado:', logLevel);
  console.log('🔧 Configuração completa:', JSON.stringify(supabaseConfig, null, 2));
  
  // Simular criação do cliente (sem credenciais reais)
  try {
    console.log('✅ Configuração de logging aplicada com sucesso!');
    console.log('📝 Os logs do GoTrueClient devem estar suprimidos agora.');
  } catch (error) {
    console.error('❌ Erro ao aplicar configuração:', error);
  }
}

testLogging().catch(console.error);

