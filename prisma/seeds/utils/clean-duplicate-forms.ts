import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicateForms() {
    console.log('🧹 [Clean Duplicate Forms] Iniciando limpeza de formulários duplicados...');

    try {
        // Buscar todos os formulários organizacionais
        const forms = await prisma.form.findMany({
            where: {
                isTemplate: false,
                deletedAt: null
            },
            include: {
                organization: true,
                questions: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`📋 Encontrados ${forms.length} formulários organizacionais`);

        // Agrupar por organização e título base
        const groupedForms = new Map<string, any[]>();

        forms.forEach(form => {
            const baseTitle = form.title.split(' - ')[0]; // Remove sufixo da organização
            const key = `${form.organizationId}_${baseTitle}`;
            
            if (!groupedForms.has(key)) {
                groupedForms.set(key, []);
            }
            groupedForms.get(key)!.push(form);
        });

        // Também agrupar templates duplicados
        const templateForms = await prisma.form.findMany({
            where: {
                isTemplate: true,
                deletedAt: null
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const templateGroups = new Map<string, any[]>();
        templateForms.forEach(form => {
            const baseTitle = form.title.split(' (com grupos)')[0].split(' - por Djalma')[0];
            const key = `template_${baseTitle}`;
            
            if (!templateGroups.has(key)) {
                templateGroups.set(key, []);
            }
            templateGroups.get(key)!.push(form);
        });

        let totalDeleted = 0;

        // Processar cada grupo de formulários organizacionais
        for (const [key, duplicateForms] of groupedForms) {
            if (duplicateForms.length > 1) {
                console.log(`\n🔍 Encontrados ${duplicateForms.length} formulários organizacionais duplicados para: ${duplicateForms[0].title.split(' - ')[0]}`);
                
                // Manter o mais antigo (primeiro criado)
                const [keepForm, ...deleteForms] = duplicateForms;
                
                console.log(`   ✅ Mantendo: ${keepForm.title} (ID: ${keepForm.id})`);
                
                // Deletar os duplicados
                for (const deleteForm of deleteForms) {
                    console.log(`   🗑️  Deletando: ${deleteForm.title} (ID: ${deleteForm.id})`);
                    
                    // Soft delete
                    await prisma.form.update({
                        where: { id: deleteForm.id },
                        data: { deletedAt: new Date() }
                    });
                    
                    totalDeleted++;
                }
            }
        }

        // Processar cada grupo de templates
        for (const [key, duplicateTemplates] of templateGroups) {
            if (duplicateTemplates.length > 1) {
                console.log(`\n🔍 Encontrados ${duplicateTemplates.length} templates duplicados para: ${duplicateTemplates[0].title.split(' (com grupos)')[0].split(' - por Djalma')[0]}`);
                
                // Manter o mais antigo (primeiro criado)
                const [keepTemplate, ...deleteTemplates] = duplicateTemplates;
                
                console.log(`   ✅ Mantendo: ${keepTemplate.title} (ID: ${keepTemplate.id})`);
                
                // Deletar os duplicados
                for (const deleteTemplate of deleteTemplates) {
                    console.log(`   🗑️  Deletando: ${deleteTemplate.title} (ID: ${deleteTemplate.id})`);
                    
                    // Soft delete
                    await prisma.form.update({
                        where: { id: deleteTemplate.id },
                        data: { deletedAt: new Date() }
                    });
                    
                    totalDeleted++;
                }
            }
        }

        if (totalDeleted === 0) {
            console.log('✅ Nenhum formulário duplicado encontrado!');
        } else {
            console.log(`\n🎉 Limpeza concluída! ${totalDeleted} formulário(s) duplicado(s) removido(s).`);
        }

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    cleanDuplicateForms()
        .catch((e) => {
            console.error('❌ Erro ao executar limpeza:', e);
            process.exit(1);
        });
}

export default cleanDuplicateForms; 