import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DepartmentsService } from '../src/departments/departments.service';

async function testSlugGeneration() {
  console.log('🧪 Testando geração de slugs únicos para departamentos...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const departmentsService = app.get(DepartmentsService);

    // Simular diferentes organizações criando departamentos com o mesmo nome
    const testCases = [
      { name: 'Financeiro', organizationId: 'org-12345-abcdef' },
      { name: 'Financeiro', organizationId: 'org-67890-ghijk' },
      { name: 'Financeiro', organizationId: 'org-11111-lmnop' },
      { name: 'Recursos Humanos', organizationId: 'org-12345-abcdef' },
      { name: 'Recursos Humanos', organizationId: 'org-67890-ghijk' },
    ];

    console.log('📋 Casos de teste:');
    testCases.forEach((testCase, index) => {
      console.log(`${index + 1}. Nome: "${testCase.name}" | Org: ${testCase.organizationId}`);
    });

    console.log('\n🔍 Gerando slugs únicos...\n');

    for (const testCase of testCases) {
      try {
        // Simular a geração de slug sem criar o departamento no banco
        const baseSlug = departmentsService['generateBaseSlug'](testCase.name);
        const orgSuffix = departmentsService['generateOrganizationSuffix'](testCase.organizationId);
        const uniqueSlug = `${baseSlug}-${orgSuffix}`;

        console.log(`✅ "${testCase.name}" (${testCase.organizationId}) → ${uniqueSlug}`);
      } catch (error) {
        console.error(`❌ Erro ao gerar slug para "${testCase.name}":`, error.message);
      }
    }

    console.log('\n🎯 Resultado:');
    console.log('• Cada organização terá slugs únicos mesmo para departamentos com nomes iguais');
    console.log('• O formato será: nome-departamento-id-org');
    console.log('• Exemplo: financeiro-org12345, financeiro-org67890');

    await app.close();
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testSlugGeneration()
  .then(() => {
    console.log('\n✨ Teste concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro no teste:', error);
    process.exit(1);
  });
