#!/usr/bin/env tsx

import { seedNotifications, cleanNotifications } from './notifications';

async function main() {
  console.log('🚀 Iniciando seed de notificações...');
  
  try {
    // Limpar notificações existentes
    await cleanNotifications();
    
    // Criar novas notificações
    await seedNotifications();
    
    console.log('✅ Seed de notificações concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no seed de notificações:', error);
    process.exit(1);
  }
}

main();
