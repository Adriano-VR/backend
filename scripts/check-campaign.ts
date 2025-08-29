import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCampaign() {
  try {
    const campaignId = '935602b7-8fd1-4092-aa18-45e2ba50511c';
    
    console.log('🔍 Verificando campanha:', campaignId);
    
    // Buscar campanha com todos os relacionamentos
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId },
      include: {
        projects: true,
        submittedForms: true,
        documents: true,
        _count: {
          select: {
            projects: true,
            submittedForms: true,
            documents: true,
          },
        },
      },
    });

    if (!campaign) {
      console.log('❌ Campanha não encontrada');
      return;
    }

    console.log('\n📊 Dados da Campanha:');
    console.log('Nome:', campaign.name);
    console.log('Status:', campaign.status);
    console.log('Contadores:');
    console.log('  - Projetos:', campaign._count.projects);
    console.log('  - Formulários:', campaign._count.submittedForms);
    console.log('  - Documentos:', campaign._count.documents);

    console.log('\n📋 Projetos Vinculados:');
    if (campaign.projects.length > 0) {
      campaign.projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.title} (${project.type}) - ${project.status}`);
      });
    } else {
      console.log('  Nenhum projeto encontrado');
    }

    console.log('\n📝 Formulários Submetidos:');
    if (campaign.submittedForms.length > 0) {
      campaign.submittedForms.forEach((form, index) => {
        console.log(`  ${index + 1}. ID: ${form.id} - Status: ${form.status}`);
      });
    } else {
      console.log('  Nenhum formulário encontrado');
    }

    console.log('\n📎 Documentos:');
    if (campaign.documents.length > 0) {
      campaign.documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.name} (${doc.fileType})`);
      });
    } else {
      console.log('  Nenhum documento encontrado');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCampaign();

