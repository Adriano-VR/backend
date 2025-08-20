import { PrismaClient } from '@prisma/client';
import { cursosData } from './courses-constants';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 [Course Seed] Iniciando seed dos cursos...');

    try {
        let totalCursos = 0;
        let totalModulos = 0;
        let totalAulas = 0;

        // Percorrer o array de cursos
        for (const cursoData of cursosData) {
            // Buscar a trilha se especificada
            let trailId: string | undefined;
            if (cursoData.trailSlug) {
                const trail = await prisma.trail.findUnique({
                    where: { slug: cursoData.trailSlug }
                });
                if (trail) {
                    trailId = trail.id;
                    console.log(`🔗 Conectando curso à trilha: ${trail.title}`);
                } else {
                    console.log(`⚠️ Trilha não encontrada: ${cursoData.trailSlug}`);
                }
            }

            // Criar curso
            const curso = await prisma.course.create({
                data: {
                    slug: cursoData.slug,
                    title: cursoData.title,
                    description: cursoData.description,
                    trailId: trailId,
                },
            });
            totalCursos++;
            console.log(`✅ Curso criado: ${curso.title} (ID: ${curso.id})`);

            // Percorrer módulos do curso
            for (const moduloData of cursoData.modules) {
                // Criar módulo
                const modulo = await prisma.module.create({
                    data: {
                        slug: moduloData.slug,
                        title: moduloData.title,
                        description: moduloData.description,
                        courseId: curso.id,
                    },
                });
                totalModulos++;

                // Percorrer aulas do módulo
                for (const aulaData of moduloData.lessons) {
                    // Criar aula
                    await prisma.lesson.create({
                        data: {
                            slug: aulaData.slug,
                            title: aulaData.title,
                            content: aulaData.content,
                            moduleId: modulo.id,
                        },
                    });
                    totalAulas++;
                }
            }

            console.log(`   📚 ${cursoData.modules.length} módulos criados`);
            console.log(`   📖 ${cursoData.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} aulas criadas`);
        }

        console.log('🎉 [Course Seed] Seed dos cursos concluído com sucesso!');
        console.log(`📊 Total de cursos criados: ${totalCursos}`);
        console.log(`📊 Total de módulos criados: ${totalModulos}`);
        console.log(`📊 Total de aulas criadas: ${totalAulas}`);

    } catch (error: any) {
        if (error.message.includes('Unique constraint failed on the fields')) {
            console.log('🎉 [Course Seed] Seed dos cursos já executado previamente!');
            return;
        }

        console.error('❌ Erro ao executar seed dos cursos:', error);
        throw error;
    }
}

// Exporta a função para ser usada em outros seeds
export default main;

// Executa apenas se o arquivo foi chamado diretamente
if (require.main === module) {
    main()
        .catch((e) => {
            console.error('❌ Erro ao executar seed dos cursos:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}