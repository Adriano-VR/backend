import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOAuthCallbackLogic() {
  console.log('🧪 [Test] Iniciando teste da lógica OAuth callback...');

  try {
    // Simular cenários de teste
    const testScenarios = [
      {
        name: 'Usuário não existe',
        userId: 'test-user-1',
        email: 'test1@example.com',
        expectedAction: 'CREATE_NEW_PROFILE'
      },
      {
        name: 'Usuário existe mas não tem profile',
        userId: 'test-user-2',
        email: 'test2@example.com',
        expectedAction: 'CREATE_NEW_PROFILE'
      },
      {
        name: 'Profile existe com mesmo email mas ID diferente',
        userId: 'test-user-3',
        email: 'existing-email@example.com',
        expectedAction: 'CREATE_NEW_PROFILE'
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n📋 [Test] Testando cenário: ${scenario.name}`);
      
      // 1. Verificar se existe profile por ID
      const profileById = await prisma.profile.findUnique({
        where: { id: scenario.userId }
      });
      
      console.log(`👤 [Test] Profile encontrado por ID: ${!!profileById}`);
      
      if (!profileById) {
        // 2. Verificar se existe profile por email
        const profileByEmail = await prisma.profile.findUnique({
          where: { email: scenario.email }
        });
        
        console.log(`📧 [Test] Profile encontrado por email: ${!!profileByEmail}`);
        
        if (profileByEmail) {
          console.log(`⚠️ [Test] Profile com email existente mas ID diferente. Deveria criar novo profile.`);
        } else {
          console.log(`✅ [Test] Nenhum profile encontrado. Deveria criar novo profile.`);
        }
      } else {
        console.log(`✅ [Test] Profile encontrado por ID. Deveria usar profile existente.`);
      }
    }

    console.log('\n🎉 [Test] Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ [Test] Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testOAuthCallbackLogic();

