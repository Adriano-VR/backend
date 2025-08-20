// Executar todos os seeds

import trailsSeed from './trails';
import coursesSeed from './courses';
import unifiedFormsSeed from './templates-forms/unified-forms-seed';

interface SeedResult {
    name: string;
    status: 'success' | 'error';
    error?: string;
}

async function main() {
    console.log('🌱 [Main Seed] Iniciando execução de todos os seeds...\n');

    const seeds = [
        { name: 'Unified Forms (with Groups)', fn: unifiedFormsSeed },
        { name: 'Trails', fn: trailsSeed },
        { name: 'Courses', fn: coursesSeed },
    ];

    const results: SeedResult[] = [];

    for (const seed of seeds) {
        try {
            console.log(`\n🔄 [Main Seed] Executando seed: ${seed.name}...`);
            await seed.fn();
            console.log(`✅ [Main Seed] Seed ${seed.name} concluído com sucesso!`);
            console.log("_".repeat(100));
            results.push({ name: seed.name, status: 'success' });
        } catch (error: any) {
            console.error(`❌ [Main Seed] Erro no seed ${seed.name}:`, error.message);
            results.push({ name: seed.name, status: 'error', error: error.message });
            // Continua executando os próximos seeds mesmo com erro
        }
    }

    console.log('\n📊 [Main Seed] Resumo da execução:');
    results.forEach(result => {
        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`   ${status} ${result.name}: ${result.status}`);
        if (result.error) {
            console.log(`      Erro: ${result.error}`);
        }
    });

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`\n🎉 [Main Seed] Execução finalizada! ${successCount} sucessos, ${errorCount} erros.`);
}

main()
    .catch((e) => {
        console.error('❌ [Main Seed] Erro crítico na execução dos seeds:', e);
        process.exit(1);
    });


