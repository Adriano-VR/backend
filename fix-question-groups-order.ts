import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQuestionGroupsOrder() {
  try {
    console.log('🔧 Corrigindo ordem dos questionGroups...');
    
    // Buscar todos os questionGroups ordenados por order atual e depois por nome
    const questionGroups = await prisma.questionGroup.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        order: true,
        slug: true
      }
    });

    console.log(`📊 Encontrados ${questionGroups.length} questionGroups para corrigir:`);
    
    // Definir nova ordem baseada em uma lógica específica
    // Vou usar a ordem que aparece no COPSOQ (baseada no teste anterior)
    const orderMap: { [key: string]: number } = {
      'Demandas no trabalho': 1,
      'Organização e conteúdo': 2, 
      'Relações sociais e liderança': 3,
      'Recompensas e valores': 4,
      'Saúde e bem‑estar': 5,
      // Para outros grupos, usar ordem sequencial
      'Autoconhecimento e identidade espiritual': 6,
      'Propósito e conexão divina': 7,
      'Desenvolvimento e crescimento espiritual': 8,
      'Serviço ao próximo e práticas espirituais': 9,
      'Depressão': 10,
      'Ansiedade': 11,
      'Estresse': 12,
      'Questões Gerais - Avaliação WHO-5 - Índice de Bem-estar OMS (cinco)': 13
    };

    // Atualizar cada grupo com nova ordem
    for (let i = 0; i < questionGroups.length; i++) {
      const group = questionGroups[i];
      let newOrder = orderMap[group.name];
      
      // Se não está no mapa, usar ordem sequencial a partir de onde parou
      if (!newOrder) {
        newOrder = Math.max(...Object.values(orderMap)) + 1;
        orderMap[group.name] = newOrder;
      }

      console.log(`🔄 Atualizando "${group.name}": order ${group.order} → ${newOrder}`);
      
      await prisma.questionGroup.update({
        where: { id: group.id },
        data: { order: newOrder }
      });
    }

    console.log('✅ Ordenação corrigida com sucesso!');
    
    // Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    const updatedGroups = await prisma.questionGroup.findMany({
      orderBy: {
        order: 'asc'
      },
      select: {
        name: true,
        order: true,
        slug: true
      }
    });

    console.log('📊 Nova ordenação:');
    updatedGroups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (order: ${group.order})`);
    });

    // Verificar se ainda há duplicatas
    const orders = updatedGroups.map(g => g.order);
    const uniqueOrders = [...new Set(orders)];
    
    if (orders.length !== uniqueOrders.length) {
      console.log('⚠️ Ainda há orders duplicados!');
    } else {
      console.log('✅ Todos os orders são únicos agora!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuestionGroupsOrder();
