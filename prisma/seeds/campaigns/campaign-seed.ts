import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCampaigns() {
  console.log('🌱 Iniciando seed de campanhas...');

  try {
    // Buscar organizações existentes
    const organizations = await prisma.organization.findMany({
      take: 3, // Pegar até 3 organizações para distribuir as campanhas
    });

    if (organizations.length === 0) {
      console.log('❌ Nenhuma organização encontrada. Execute o seed de organizações primeiro.');
      return;
    }

    // Buscar usuários existentes
    const users = await prisma.profile.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin']
        }
      },
      take: 3,
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado. Execute o seed de usuários primeiro.');
      return;
    }

    // Criar campanhas de exemplo mais variadas
    const campaigns = [
      // Campanhas de Segurança
      {
        name: 'Campanha de Segurança 2024 - Semestre 1',
        description: 'Campanha semestral focada em conscientização sobre segurança no trabalho, incluindo treinamentos sobre uso de EPIs e procedimentos de emergência',
        frequency: 'semestral' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Segurança 2024 - Semestre 2',
        description: 'Segunda parte da campanha anual de segurança, focando em prevenção de acidentes e cultura de segurança',
        frequency: 'semestral' as const,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },

      // Campanhas de Saúde Mental
      {
        name: 'Campanha de Saúde Mental - Q1 2024',
        description: 'Campanha trimestral para promoção da saúde mental dos colaboradores, incluindo workshops sobre gestão de estresse',
        frequency: 'trimestral' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'completed' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Saúde Mental - Q2 2024',
        description: 'Segundo trimestre focado em bem-estar emocional e prevenção de burnout',
        frequency: 'trimestral' as const,
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-06-30'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Saúde Mental - Q3 2024',
        description: 'Terceiro trimestre com foco em resiliência e habilidades de enfrentamento',
        frequency: 'trimestral' as const,
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-09-30'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Saúde Mental - Q4 2024',
        description: 'Quarto trimestre focado em preparação para o fim do ano e planejamento para 2025',
        frequency: 'trimestral' as const,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-31'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },

      // Campanhas Anuais
      {
        name: 'Campanha Anual de Compliance 2024',
        description: 'Campanha anual para treinamento e atualização de políticas de compliance, incluindo LGPD e ética empresarial',
        frequency: 'anual' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Sustentabilidade 2024',
        description: 'Iniciativa anual para promover práticas sustentáveis e responsabilidade ambiental na organização',
        frequency: 'anual' as const,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-02-28'),
        status: 'active' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },

      // Campanhas Mensais
      {
        name: 'Campanha de Bem-estar - Janeiro 2024',
        description: 'Início do ano com foco em resoluções de saúde e bem-estar pessoal',
        frequency: 'mensal' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'completed' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Bem-estar - Fevereiro 2024',
        description: 'Mês do carnaval com foco em equilíbrio entre trabalho e lazer',
        frequency: 'mensal' as const,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-29'),
        status: 'completed' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },
      {
        name: 'Campanha de Bem-estar - Março 2024',
        description: 'Mês da mulher com foco em empoderamento e igualdade de gênero',
        frequency: 'mensal' as const,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        status: 'completed' as const,
        organizationId: organizations[0]?.id,
        createdById: users[0]?.id,
      },

      // Campanhas para outras organizações (se existirem)
      ...(organizations[1] ? [{
        name: 'Campanha de Inovação 2024',
        description: 'Campanha semestral para fomentar a criatividade e inovação na organização',
        frequency: 'semestral' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        status: 'active' as const,
        organizationId: organizations[1].id,
        createdById: users[1]?.id || users[0]?.id,
      }] : []),

      ...(organizations[2] ? [{
        name: 'Campanha de Diversidade e Inclusão 2024',
        description: 'Iniciativa anual para promover diversidade, equidade e inclusão no ambiente de trabalho',
        frequency: 'anual' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active' as const,
        organizationId: organizations[2].id,
        createdById: users[2]?.id || users[0]?.id,
      }] : []),
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const campaignData of campaigns) {
      try {
        const existingCampaign = await prisma.campaign.findFirst({
          where: {
            name: campaignData.name,
            organizationId: campaignData.organizationId,
          },
        });

        if (!existingCampaign) {
          const campaign = await prisma.campaign.create({
            data: campaignData,
          });
          console.log(`✅ Campanha criada: ${campaign.name}`);
          createdCount++;
        } else {
          console.log(`⏭️ Campanha já existe: ${campaignData.name}`);
          existingCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao criar campanha ${campaignData.name}:`, error);
      }
    }

    console.log('\n📊 Resumo do Seed de Campanhas:');
    console.log(`✅ Campanhas criadas: ${createdCount}`);
    console.log(`⏭️ Campanhas já existentes: ${existingCount}`);
    console.log(`📈 Total de campanhas no sistema: ${await prisma.campaign.count()}`);
    console.log('🎉 Seed de campanhas concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar seed de campanhas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o seed se o arquivo for executado diretamente
if (require.main === module) {
  seedCampaigns();
}
