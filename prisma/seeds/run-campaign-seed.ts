#!/usr/bin/env ts-node

import { seedCampaigns } from './campaigns/campaign-seed';

console.log('🚀 Executando Seed de Campanhas...\n');

async function main() {
  try {
    await seedCampaigns();
    console.log('\n✨ Seed de campanhas executado com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro ao executar seed de campanhas:', error);
    process.exit(1);
  }
}

main();

