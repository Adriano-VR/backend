import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeOneCopsoq() {
  // Buscar um formulário COPSOQ específico
  const form = await prisma.form.findFirst({
    where: { 
      slug: 'form_copsoq_core',
      isTemplate: true 
    }
  });
  
  if (form) {
    console.log(`🗑️ Removendo formulário: ${form.title}`);
    
    // Remover associações form-question
    await prisma.formQuestion.deleteMany({
      where: { formId: form.id }
    });
    
    // Remover o formulário
    await prisma.form.delete({
      where: { id: form.id }
    });
    
    console.log(`✅ Formulário removido`);
  } else {
    console.log('❌ Formulário COPSOQ Core não encontrado');
  }
}

removeOneCopsoq().then(() => process.exit(0)).catch(console.error);
