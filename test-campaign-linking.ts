import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCampaignLinking() {
  console.log('🧪 [TestCampaignLinking] Iniciando teste de vinculação automática...');

  try {
    // 1. Buscar uma organização com campanha ativa
    const organizationWithActiveCampaign = await prisma.organization.findFirst({
      where: {
        campaigns: {
          some: {
            status: 'active',
            deletedAt: null,
          },
        },
      },
      include: {
        campaigns: {
          where: {
            status: 'active',
            deletedAt: null,
          },
          take: 1,
        },
        forms: {
          take: 1,
        },
      },
    });

    if (!organizationWithActiveCampaign) {
      console.log('❌ [TestCampaignLinking] Nenhuma organização com campanha ativa encontrada');
      return;
    }

    const activeCampaign = organizationWithActiveCampaign.campaigns[0];
    const form = organizationWithActiveCampaign.forms[0];

    if (!form) {
      console.log('❌ [TestCampaignLinking] Nenhum formulário encontrado na organização');
      return;
    }

    console.log(`✅ [TestCampaignLinking] Organização: ${organizationWithActiveCampaign.name}`);
    console.log(`✅ [TestCampaignLinking] Campanha ativa: ${activeCampaign.name}`);
    console.log(`✅ [TestCampaignLinking] Formulário: ${form.title}`);

    // 2. Buscar um usuário da organização
    const user = await prisma.profile.findFirst({
      where: {
        organizationMemberships: {
          some: {
            organizationId: organizationWithActiveCampaign.id,
          },
        },
      },
    });

    if (!user) {
      console.log('❌ [TestCampaignLinking] Nenhum usuário encontrado na organização');
      return;
    }

    console.log(`✅ [TestCampaignLinking] Usuário: ${user.name} (${user.email})`);

    // 3. Criar um submitted form (simulando a API)
    console.log('📝 [TestCampaignLinking] Criando submitted form...');
    
    const submittedForm = await prisma.submittedForm.create({
      data: {
        formId: form.id,
        profileId: user.id,
        status: 'pending',
        // Não fornecer campaignId - deve ser vinculado automaticamente
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        form: {
          select: {
            id: true,
            title: true,
          },
        },
        profile: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('📊 [TestCampaignLinking] Resultado:');
    console.log(`   - Submitted Form ID: ${submittedForm.id}`);
    console.log(`   - Formulário: ${submittedForm.form?.title}`);
    console.log(`   - Usuário: ${submittedForm.profile?.name}`);
    console.log(`   - Campanha vinculada: ${submittedForm.campaign?.name || 'Nenhuma'}`);
    console.log(`   - Campaign ID: ${submittedForm.campaignId || 'null'}`);

    if (submittedForm.campaignId === activeCampaign.id) {
      console.log('✅ [TestCampaignLinking] SUCESSO: Submitted form foi vinculado automaticamente à campanha ativa!');
    } else {
      console.log('❌ [TestCampaignLinking] FALHA: Submitted form não foi vinculado à campanha ativa');
    }

    // 4. Testar cenário sem campanha ativa
    console.log('\n🧪 [TestCampaignLinking] Testando cenário sem campanha ativa...');
    
    // Pausar a campanha ativa
    await prisma.campaign.update({
      where: { id: activeCampaign.id },
      data: { status: 'paused' },
    });

    console.log('⏸️ [TestCampaignLinking] Campanha pausada');

    // Criar outro submitted form
    const submittedFormWithoutCampaign = await prisma.submittedForm.create({
      data: {
        formId: form.id,
        profileId: user.id,
        status: 'pending',
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`📊 [TestCampaignLinking] Resultado sem campanha ativa:`);
    console.log(`   - Submitted Form ID: ${submittedFormWithoutCampaign.id}`);
    console.log(`   - Campanha vinculada: ${submittedFormWithoutCampaign.campaign?.name || 'Nenhuma'}`);
    console.log(`   - Campaign ID: ${submittedFormWithoutCampaign.campaignId || 'null'}`);

    if (!submittedFormWithoutCampaign.campaignId) {
      console.log('✅ [TestCampaignLinking] SUCESSO: Submitted form não foi vinculado (não há campanha ativa)');
    } else {
      console.log('❌ [TestCampaignLinking] FALHA: Submitted form foi vinculado mesmo sem campanha ativa');
    }

    // 5. Reativar a campanha
    await prisma.campaign.update({
      where: { id: activeCampaign.id },
      data: { status: 'active' },
    });

    console.log('🔄 [TestCampaignLinking] Campanha reativada');

  } catch (error) {
    console.error('❌ [TestCampaignLinking] Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testCampaignLinking();
