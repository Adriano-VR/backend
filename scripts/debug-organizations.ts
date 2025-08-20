import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugOrganizations() {
  try {
    console.log('🔍 Debugando organizações no banco...')
    
    // Buscar todas as organizações
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        cnpj: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Total de organizações: ${organizations.length}`)
    console.log('\n📋 Lista de organizações:')
    console.log('='.repeat(80))
    
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. Nome: ${org.name}`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Slug: ${org.slug}`)
      console.log(`   CNPJ: ${org.cnpj || 'N/A'}`)
      console.log(`   Criada em: ${org.createdAt.toISOString()}`)
      console.log(`   Atualizada em: ${org.updatedAt.toISOString()}`)
      console.log('-'.repeat(40))
    })
    
    // Procurar por organizações com slug "eeee"
    const eeeeOrgs = organizations.filter(org => org.slug.startsWith('eeee-'))
    if (eeeeOrgs.length > 0) {
      console.log(`\n🎯 Organizações com slug "eeee-":`)
      eeeeOrgs.forEach(org => {
        console.log(`   - ${org.name}: ${org.slug}`)
      })
    }
    
    // Procurar por organizações com nome "eeee"
    const eeeeNameOrgs = organizations.filter(org => 
      org.name.toLowerCase().includes('eeee')
    )
    if (eeeeNameOrgs.length > 0) {
      console.log(`\n🎯 Organizações com nome contendo "eeee":`)
      eeeeNameOrgs.forEach(org => {
        console.log(`   - ${org.name}: ${org.slug}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao debugar organizações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugOrganizations()
  .catch(console.error)


