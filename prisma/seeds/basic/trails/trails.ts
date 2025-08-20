import { PrismaClient } from '@prisma/client';
import { trilhasData } from './trails-constants';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 [Trail Seed] Iniciando seed das trilhas...');

    try {
        let totalTrilhas = 0;

        // Percorrer o array de trilhas
        for (const trilhaData of trilhasData) {
            // Criar trilha
            const trilha = await prisma.trail.create({
                data: {
                    slug: trilhaData.slug,
                    title: trilhaData.title,
                    description: trilhaData.description,
                },
            });
            totalTrilhas++;
            console.log(`✅ Trilha criada: ${trilha.title} (ID: ${trilha.id})`);
        }

        console.log('🎉 [Trail Seed] Seed das trilhas concluído com sucesso!');
        console.log(`📊 Total de trilhas criadas: ${totalTrilhas}`);

    } catch (error: any) {
        if (error.message.includes('Unique constraint failed on the fields')) {
            console.log('🎉 [Trail Seed] Seed das trilhas já executado previamente!');
            return;
        }

        console.error('❌ Erro ao executar seed das trilhas:', error);
        throw error;
    }
}

// Exporta a função para ser usada em outros seeds
export default main;

// Executa apenas se o arquivo foi chamado diretamente
if (require.main === module) {
    main()
        .catch((e) => {
            console.error('❌ Erro ao executar seed das trilhas:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
