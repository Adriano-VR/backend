import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNotifications() {
  console.log('🌱 Iniciando seed de notificações...');

  try {
    // Buscar um usuário existente para associar as notificações
    const user = await prisma.profile.findFirst({
      where: {
        role: {
          in: ['admin', 'super_admin']
        }
      }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado para associar as notificações');
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);

    // Dados das notificações
    const notifications = [
      {
        title: 'Bem-vindo ao MenteSegura!',
        message: 'Sua conta foi criada com sucesso. Explore nossa plataforma de saúde mental corporativa.',
        profileId: user.id,
        isRead: false,
      },
      {
        title: 'Nova campanha disponível',
        message: 'Uma nova campanha de avaliação de saúde mental foi criada para sua organização.',
        profileId: user.id,
        isRead: false,
      },
      {
        title: 'Formulário pendente',
        message: 'Você tem um formulário de avaliação pendente que precisa ser preenchido.',
        profileId: user.id,
        isRead: true,
      },
      {
        title: 'Relatório gerado',
        message: 'O relatório de saúde mental da sua organização foi gerado e está disponível para download.',
        profileId: user.id,
        isRead: false,
      },
      {
        title: 'Lembrete de reunião',
        message: 'Você tem uma reunião agendada para amanhã às 14:00 sobre os resultados da avaliação.',
        profileId: user.id,
        isRead: false,
      },
    ];

    // Criar as notificações
    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification,
      });
    }

    console.log(`✅ ${notifications.length} notificações criadas com sucesso!`);
    
    // Listar as notificações criadas
    const createdNotifications = await prisma.notification.findMany({
      where: {
        profileId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📋 Notificações criadas:');
    createdNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.isRead ? 'Lida' : 'Não lida'})`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar notificações:', error);
    throw error;
  }
}

export async function cleanNotifications() {
  console.log('🧹 Limpando notificações existentes...');
  
  try {
    await prisma.notification.deleteMany({});
    console.log('✅ Notificações removidas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar notificações:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedNotifications()
    .catch((error) => {
      console.error('❌ Erro no seed de notificações:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
