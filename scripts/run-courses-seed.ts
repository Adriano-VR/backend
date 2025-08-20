#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 [Courses Seed Runner] Iniciando execução dos seeds...\n');

    try {
        // Executar seed de trilhas primeiro
        console.log('🌱 [1/2] Executando seed de trilhas...');
        const trailsSeed = require('../prisma/seeds/basic/trails/trails').default;
        await trailsSeed();
        console.log('✅ Seed de trilhas concluído!\n');

        // Executar seed de cursos
        console.log('🌱 [2/2] Executando seed de cursos...');
        const coursesSeed = require('../prisma/seeds/basic/courses/courses').default;
        await coursesSeed();
        console.log('✅ Seed de cursos concluído!\n');

        console.log('🎉 [Courses Seed Runner] Todos os seeds foram executados com sucesso!');
        console.log('📚 Trilhas, cursos, módulos e aulas foram criados no banco de dados.');

    } catch (error) {
        console.error('❌ [Courses Seed Runner] Erro durante a execução:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar apenas se o arquivo foi chamado diretamente
if (require.main === module) {
    main()
        .catch((e) => {
            console.error('❌ [Courses Seed Runner] Erro crítico:', e);
            process.exit(1);
        });
}
