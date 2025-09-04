import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCampaignsWithProjects() {
  console.log('🌱 Iniciando seed avançado de campanhas com projetos...');

  try {
    // Buscar organizações existentes
    const organizations = await prisma.organization.findMany({
      take: 2,
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
      take: 2,
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado. Execute o seed de usuários primeiro.');
      return;
    }

    const organization = organizations[0];
    const user = users[0];

    // Criar campanha principal com projetos
    const mainCampaign = await prisma.campaign.create({
      data: {
        name: 'Campanha de Saúde Mental e Bem-estar 2024',
        description: 'Campanha anual abrangente para promoção da saúde mental e bem-estar organizacional, incluindo prevenção de burnout, gestão de estresse e desenvolvimento de resiliência',
        frequency: 'anual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        organizationId: organization.id,
        createdById: user.id,
      },
    });

    console.log(`✅ Campanha principal criada: ${mainCampaign.name}`);

    // Criar projetos vinculados à campanha
    const projects = [
      {
        title: 'Projeto Preventivo - Avaliação de Riscos Psicossociais',
        slug: 'avaliacao-riscos-psicossociais-2024',
        description: 'Identificação e avaliação de fatores de risco psicossociais na organização',
        type: 'preventivo' as const,
        status: 'in_progress' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: 'Projeto Contingencial - Programa de Intervenção em Crise',
        slug: 'programa-intervencao-crise-2024',
        description: 'Protocolos e procedimentos para intervenção em situações de crise de saúde mental',
        type: 'preventivo' as const,
        status: 'pending' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: 'Projeto de Treinamento - Workshops de Bem-estar',
        slug: 'workshops-bem-estar-2024',
        description: 'Série de workshops mensais sobre temas de saúde mental e bem-estar',
        type: 'checklist' as const,
        status: 'in_progress' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
    ];

    for (const projectData of projects) {
      const project = await prisma.project.create({
        data: projectData,
      });
      console.log(`✅ Projeto criado: ${project.title}`);

      // Vincular projeto à campanha
      await prisma.project.update({
        where: { id: project.id },
        data: {
          campaigns: {
            connect: { id: mainCampaign.id }
          }
        }
      });
      console.log(`🔗 Projeto vinculado à campanha: ${project.title}`);
    }

    // Criar documentos da campanha
    const documents = [
      {
        name: 'Manual de Saúde Mental Organizacional',
        description: 'Guia completo com políticas e procedimentos de saúde mental',
        fileUrl: 'https://example.com/manual-saude-mental.pdf',
        fileType: 'application/pdf',
        fileSize: 2048576, // 2MB
        campaignId: mainCampaign.id,
        uploadedById: user.id,
      },
      {
        name: 'Apresentação - Campanha de Bem-estar',
        description: 'Slides de apresentação da campanha para stakeholders',
        fileUrl: 'https://example.com/apresentacao-campanha.pptx',
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        fileSize: 1048576, // 1MB
        campaignId: mainCampaign.id,
        uploadedById: user.id,
      },
      {
        name: 'Checklist de Implementação',
        description: 'Lista de verificação para implementação das ações da campanha',
        fileUrl: 'https://example.com/checklist-implementacao.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 512000, // 500KB
        campaignId: mainCampaign.id,
        uploadedById: user.id,
      },
    ];

    for (const documentData of documents) {
      const document = await prisma.campaignDocument.create({
        data: documentData,
      });
      console.log(`✅ Documento criado: ${document.name}`);
    }

    // Criar campanha de segurança
    const securityCampaign = await prisma.campaign.create({
      data: {
        name: 'Campanha de Segurança e Prevenção 2024',
        description: 'Campanha semestral focada em segurança do trabalho e prevenção de acidentes',
        frequency: 'semestral',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        status: 'active',
        organizationId: organization.id,
        createdById: user.id,
      },
    });

    console.log(`✅ Campanha de segurança criada: ${securityCampaign.name}`);

    // Criar projetos para campanha de segurança
    const securityProjects = [
      {
        title: 'Projeto Preventivo - Treinamento de EPIs',
        slug: 'treinamento-epis-2024',
        description: 'Capacitação sobre uso correto de equipamentos de proteção individual',
        type: 'preventivo' as const,
        status: 'completed' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: 'Projeto Contingencial - Plano de Emergência',
        slug: 'plano-emergencia-2024',
        description: 'Desenvolvimento e teste de planos de emergência e evacuação',
        type: 'preventivo' as const,
        status: 'in_progress' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
    ];

    for (const projectData of securityProjects) {
      const project = await prisma.project.create({
        data: projectData,
      });
      console.log(`✅ Projeto de segurança criado: ${project.title}`);

      // Vincular projeto à campanha de segurança
      await prisma.project.update({
        where: { id: project.id },
        data: {
          campaigns: {
            connect: { id: securityCampaign.id }
          }
        }
      });
      console.log(`🔗 Projeto vinculado à campanha de segurança: ${project.title}`);
    }

    // Criar campanha trimestral
    const quarterlyCampaign = await prisma.campaign.create({
      data: {
        name: 'Campanha de Desenvolvimento Pessoal Q1-Q4 2024',
        description: 'Campanha trimestral para desenvolvimento de habilidades pessoais e profissionais',
        frequency: 'trimestral',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        organizationId: organization.id,
        createdById: user.id,
      },
    });

    console.log(`✅ Campanha trimestral criada: ${quarterlyCampaign.name}`);

    // Criar projetos para campanha trimestral
    const quarterlyProjects = [
      {
        title: 'Projeto Q1 - Comunicação Efetiva',
        slug: 'comunicacao-efetiva-q1-2024',
        description: 'Workshops sobre comunicação assertiva e feedback construtivo',
        type: 'checklist' as const,
        status: 'completed' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: 'Projeto Q2 - Gestão de Tempo',
        slug: 'gestao-tempo-q2-2024',
        description: 'Treinamentos sobre produtividade e organização pessoal',
        type: 'checklist' as const,
        status: 'in_progress' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: 'Projeto Q3 - Liderança Situacional',
        slug: 'lideranca-situacional-q3-2024',
        description: 'Desenvolvimento de habilidades de liderança adaptativa',
        type: 'checklist' as const,
        status: 'pending' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
      {
        title: 'Projeto Q4 - Planejamento Estratégico Pessoal',
        slug: 'planejamento-estrategico-q4-2024',
        description: 'Workshops sobre definição de metas e planejamento de carreira',
        type: 'checklist' as const,
        status: 'pending' as const,
        organizationId: organization.id,
        createdById: user.id,
      },
    ];

    for (const projectData of quarterlyProjects) {
      const project = await prisma.project.create({
        data: projectData,
      });
      console.log(`✅ Projeto trimestral criado: ${project.title}`);

      // Vincular projeto à campanha trimestral
      await prisma.project.update({
        where: { id: project.id },
        data: {
          campaigns: {
            connect: { id: quarterlyCampaign.id }
          }
        }
      });
      console.log(`🔗 Projeto vinculado à campanha trimestral: ${project.title}`);
    }

    // Estatísticas finais
    const totalCampaigns = await prisma.campaign.count();
    const totalProjects = await prisma.project.count();
    const totalDocuments = await prisma.campaignDocument.count();

    console.log('\n📊 Resumo do Seed Avançado:');
    console.log(`✅ Campanhas criadas: ${totalCampaigns}`);
    console.log(`✅ Projetos criados: ${totalProjects}`);
    console.log(`✅ Documentos criados: ${totalDocuments}`);
    console.log('🎉 Seed avançado de campanhas concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar seed avançado de campanhas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o seed se o arquivo for executado diretamente
if (require.main === module) {
  seedCampaignsWithProjects();
}
