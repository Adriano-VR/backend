/**
 * Script para verificar se um usuário existe no banco
 * Uso: pnpm ts-node scripts/check-user.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function checkUser() {
  const email = 'marcosul@gmail.com';
  
  try {
    console.log('🔍 [Check] Verificando usuário:', email);
    
    // Verificar no banco local
    const localUser = await prisma.profile.findUnique({
      where: { email }
    });
    
    if (localUser) {
      console.log('✅ [Check] Usuário encontrado no banco local:');
      console.log('   ID:', localUser.id);
      console.log('   Nome:', localUser.name);
      console.log('   Email:', localUser.email);
      console.log('   Criado em:', localUser.createdAt);
      
      console.log('\n🗑️ [Check] Para remover o usuário, execute:');
      console.log(`   await prisma.profile.delete({ where: { email: '${email}' } })`);
      
    } else {
      console.log('❌ [Check] Usuário não encontrado no banco local');
    }
    
  } catch (error) {
    console.error('❌ [Check] Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkUser().catch(console.error);
