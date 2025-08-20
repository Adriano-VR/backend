import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixOrganizationSlug() {
  try {
    console.log('🔍 Procurando por organizações com slug incorreto...')
    
    // Buscar todas as organizações
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Encontradas ${organizations.length} organizações:`)
    organizations.forEach(org => {
      console.log(`   - ${org.name} (ID: ${org.id}) - Slug: ${org.slug}`)
    })
    
    // Procurar por organizações que começam com "eeee"
    const eeeeOrganizations = organizations.filter(org => 
      org.slug.startsWith('eeee-')
    )
    
    if (eeeeOrganizations.length > 0) {
      console.log(`\n🎯 Encontradas ${eeeeOrganizations.length} organizações com slug "eeee-":`)
      eeeeOrganizations.forEach(org => {
        console.log(`   - ${org.name} (ID: ${org.id}) - Slug atual: ${org.slug}`)
      })
      
      // Para cada organização, gerar um novo slug baseado no nome
      for (const org of eeeeOrganizations) {
        const newSlug = generateDeterministicSlug(org.name)
        console.log(`   🔄 Atualizando ${org.name}: ${org.slug} → ${newSlug}`)
        
        await prisma.organization.update({
          where: { id: org.id },
          data: { slug: newSlug }
        })
        
        console.log(`   ✅ Slug atualizado com sucesso!`)
      }
    } else {
      console.log('\n✅ Nenhuma organização com slug "eeee-" encontrada.')
    }
    
    console.log('\n🎉 Processo concluído!')
    
  } catch (error) {
    console.error('❌ Erro ao corrigir slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function generateDeterministicSlug(text: string): string {
  // Remover caracteres especiais e espaços, converter para minúsculas
  const cleanText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
  
  // Gerar um número baseado no hash do texto para ser determinístico
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Converte para 32-bit integer
  }
  
  // Usar o valor absoluto do hash para gerar um número de 6 dígitos
  const number = Math.abs(hash) % 1000000
  
  return cleanText + '-' + number.toString().padStart(6, '0')
}

// Executar o script
fixOrganizationSlug()
  .catch(console.error)


