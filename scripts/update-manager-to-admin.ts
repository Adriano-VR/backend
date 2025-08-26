import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateManagerToAdmin() {
  console.log('🔄 Iniciando atualização de "manager" para "admin"...');

  try {
    // 1. Atualizar profiles com role 'manager'
    const profilesUpdated = await prisma.profile.updateMany({
      where: {
        role: 'manager' as any
      },
      data: {
        role: 'admin' as any
      }
    });

    console.log(`✅ ${profilesUpdated.count} perfis atualizados de 'manager' para 'admin'`);

    // 2. Atualizar organizationMembers com role 'manager'
    const membersUpdated = await prisma.organizationMember.updateMany({
      where: {
        role: 'manager' as any
      },
      data: {
        role: 'admin' as any
      }
    });

    console.log(`✅ ${membersUpdated.count} membros de organização atualizados de 'manager' para 'admin'`);

    console.log('🎉 Atualização concluída com sucesso!');
    console.log('📝 Agora você pode executar: npx prisma migrate dev --name update_role_manager_to_admin');

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
updateManagerToAdmin()
  .catch((error) => {
    console.error('❌ Falha na atualização:', error);
    process.exit(1);
  });
