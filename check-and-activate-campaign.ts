import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndActivateCampaign() {
  console.log('🔍 [checkAndActivateCampaign] Verificando campanhas da organização...');

  try {
    // Buscar a organização específica
    const organizationId = '906e8c30-1d83-423b-9453-69e49974a514';
    
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        campaigns: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!organization) {
      console.log('❌ [checkAndActivateCampaign] Organização não encontrada');
      return;
    }

    console.log(`✅ [checkAndActivateCampaign] Organização: ${organization.name}`);
    console.log(`📊 [checkAndActivateCampaign] Total de campanhas: ${organization.campaigns.length}`);

    organization.campaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name} - Status: ${campaign.status}`);
    });

    // Verificar se há campanha ativa
    const activeCampaign = organization.campaigns.find(c => c.status === 'active');
    
    if (activeCampaign) {
      console.log(`✅ [checkAndActivateCampaign] Campanha ativa encontrada: ${activeCampaign.name}`);
    } else {
      console.log('⚠️ [checkAndActivateCampaign] Nenhuma campanha ativa encontrada');
      
      // Ativar a primeira campanha disponível
      const firstCampaign = organization.campaigns[0];
      if (firstCampaign) {
        console.log(`🔄 [checkAndActivateCampaign] Ativando campanha: ${firstCampaign.name}`);
        
        await prisma.campaign.update({
          where: { id: firstCampaign.id },
          data: { status: 'active' },
        });
        
        console.log(`✅ [checkAndActivateCampaign] Campanha ativada com sucesso!`);
      } else {
        console.log('❌ [checkAndActivateCampaign] Nenhuma campanha disponível para ativar');
      }
    }

  } catch (error) {
    console.error('❌ [checkAndActivateCampaign] Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
checkAndActivateCampaign();
