import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCopsoqGroups() {
  console.log('🔧 Removendo formulários COPSOQ para recriação...');
  
  // Buscar formulários COPSOQ
  const copsoqForms = await prisma.form.findMany({
    where: { 
      slug: { contains: 'copsoq' },
      isTemplate: true 
    },
    include: {
      questions: true
    }
  });
  
  console.log(`📋 Encontrados ${copsoqForms.length} formulários COPSOQ`);
  
  for (const form of copsoqForms) {
    console.log(`🗑️ Removendo formulário: ${form.title}`);
    
    // Remover associações form-question
    await prisma.formQuestion.deleteMany({
      where: { formId: form.id }
    });
    
    // Remover o formulário
    await prisma.form.delete({
      where: { id: form.id }
    });
    
    console.log(`✅ Formulário ${form.title} removido`);
  }
  
  console.log('🎉 Remoção concluída! Agora execute o seed novamente.');
}

fixCopsoqGroups().then(() => process.exit(0)).catch(console.error);
