import { PrismaClient, ProjectType, TarefaStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Interface para os dados do checklist
interface ChecklistData {
  title: string
  description: string
  type: string
  phases: {
    [key: string]: {
      title: string
      description: string
      tarefas: Array<{
        titulo: string
        descricao: string
        responsavel: string
        prazo: string
        status: string
        prioridade: string
      }>
    }
  }
  metas: {
    [key: string]: string
  }
  legislacoes: string[]
}

// Dados do checklist (hardcoded para evitar problemas de import)
const checklistData: ChecklistData = {
  "title": "Checklist SST - Ciclo PDCA para Ergonomia e Fatores Psicossociais",
  "description": "Checklist baseado na NR-1 subitem 1.5.3.4 e ISO 45001:2018 com foco em ergonomia e ISO 45003:2021 para fatores psicossociais",
  "type": "checklist",
  "phases": {
    "PLAN": {
      "title": "PLAN - Planejar",
      "description": "Fase de planejamento e identificação de riscos",
      "tarefas": [
        {
          "titulo": "Análise de Riscos Ergonômicos",
          "descricao": "Identificar e avaliar riscos ergonômicos nos postos de trabalho, incluindo movimentos repetitivos, posturas inadequadas e sobrecarga muscular",
          "responsavel": "Engenheiro de Segurança do Trabalho",
          "prazo": "30 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Avaliação de Fatores Psicossociais",
          "descricao": "Aplicar questionários e realizar entrevistas para identificar fatores psicossociais de risco (estresse, assédio, sobrecarga de trabalho)",
          "responsavel": "Psicólogo do Trabalho",
          "prazo": "45 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Mapeamento de Postos de Trabalho",
          "descricao": "Mapear todos os postos de trabalho da organização com foco em ergonomia e condições psicossociais",
          "responsavel": "Técnico de Segurança",
          "prazo": "20 dias",
          "status": "pendente",
          "prioridade": "média"
        },
        {
          "titulo": "Definição de Metas e Objetivos",
          "descricao": "Estabelecer metas mensuráveis para redução de riscos ergonômicos e psicossociais",
          "responsavel": "Coordenador de SST",
          "prazo": "15 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Planejamento de Recursos",
          "descricao": "Definir recursos necessários (humanos, financeiros e materiais) para implementação das ações",
          "responsavel": "Gerente de RH",
          "prazo": "25 dias",
          "status": "pendente",
          "prioridade": "média"
        }
      ]
    },
    "DO": {
      "title": "DO - Fazer",
      "description": "Fase de implementação das ações planejadas",
      "tarefas": [
        {
          "titulo": "Implementação de Melhorias Ergonômicas",
          "descricao": "Executar melhorias nos postos de trabalho: ajuste de mobiliário, iluminação, temperatura e ruído",
          "responsavel": "Equipe de Manutenção",
          "prazo": "60 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Treinamento em Ergonomia",
          "descricao": "Capacitar colaboradores sobre posturas corretas, alongamentos e uso adequado de equipamentos",
          "responsavel": "Instrutor de SST",
          "prazo": "30 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Programa de Gestão de Estresse",
          "descricao": "Implementar programa de gestão de estresse com técnicas de relaxamento e mindfulness",
          "responsavel": "Psicólogo Organizacional",
          "prazo": "45 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Reestruturação de Processos",
          "descricao": "Reorganizar processos de trabalho para reduzir sobrecarga e melhorar distribuição de tarefas",
          "responsavel": "Analista de Processos",
          "prazo": "90 dias",
          "status": "pendente",
          "prioridade": "média"
        },
        {
          "titulo": "Implementação de Pausas Programadas",
          "descricao": "Estabelecer sistema de pausas programadas para trabalhos repetitivos e monótonos",
          "responsavel": "Supervisor de Produção",
          "prazo": "20 dias",
          "status": "pendente",
          "prioridade": "média"
        }
      ]
    },
    "CHECK": {
      "title": "CHECK - Verificar",
      "description": "Fase de monitoramento e verificação das ações implementadas",
      "tarefas": [
        {
          "titulo": "Avaliação Pós-Implementação",
          "descricao": "Realizar nova avaliação ergonômica para verificar efetividade das melhorias implementadas",
          "responsavel": "Engenheiro de Segurança",
          "prazo": "30 dias após implementação",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Monitoramento de Indicadores",
          "descricao": "Acompanhar indicadores de saúde: absenteísmo, LER/DORT, acidentes de trabalho e queixas psicossociais",
          "responsavel": "Analista de RH",
          "prazo": "Contínuo",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Pesquisa de Satisfação",
          "descricao": "Aplicar pesquisa de satisfação para avaliar percepção dos colaboradores sobre as melhorias",
          "responsavel": "Psicólogo Organizacional",
          "prazo": "60 dias após implementação",
          "status": "pendente",
          "prioridade": "média"
        },
        {
          "titulo": "Auditoria de Conformidade",
          "descricao": "Realizar auditoria para verificar conformidade com NR-1, ISO 45001 e legislações aplicáveis",
          "responsavel": "Auditor de SST",
          "prazo": "90 dias após implementação",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Análise de Efetividade",
          "descricao": "Analisar dados coletados para determinar efetividade das ações implementadas",
          "responsavel": "Analista de Dados",
          "prazo": "45 dias após implementação",
          "status": "pendente",
          "prioridade": "média"
        }
      ]
    },
    "ACT": {
      "title": "ACT - Agir",
      "description": "Fase de correção e melhoria contínua",
      "tarefas": [
        {
          "titulo": "Identificação de Não-Conformidades",
          "descricao": "Identificar ações que não atingiram os resultados esperados e necessitam de correção",
          "responsavel": "Coordenador de SST",
          "prazo": "15 dias após verificação",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Planejamento de Correções",
          "descricao": "Desenvolver plano de ação para correção das não-conformidades identificadas",
          "responsavel": "Engenheiro de Segurança",
          "prazo": "30 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Implementação de Correções",
          "descricao": "Executar as correções necessárias baseadas nos resultados da verificação",
          "responsavel": "Equipe de Implementação",
          "prazo": "60 dias",
          "status": "pendente",
          "prioridade": "alta"
        },
        {
          "titulo": "Atualização de Procedimentos",
          "descricao": "Revisar e atualizar procedimentos de SST com base nas lições aprendidas",
          "responsavel": "Técnico de SST",
          "prazo": "45 dias",
          "status": "pendente",
          "prioridade": "média"
        },
        {
          "titulo": "Planejamento do Próximo Ciclo",
          "descricao": "Definir objetivos e metas para o próximo ciclo PDCA, incorporando melhorias contínuas",
          "responsavel": "Gerente de SST",
          "prazo": "30 dias",
          "status": "pendente",
          "prioridade": "alta"
        }
      ]
    }
  },
  "metas": {
    "reducao_ler_dort": "Reduzir casos de LER/DORT em 30% no primeiro ano",
    "reducao_estresse": "Reduzir níveis de estresse reportados em 25%",
    "melhoria_ergonomia": "100% dos postos críticos com melhorias ergonômicas implementadas",
    "treinamento": "100% dos colaboradores treinados em ergonomia e fatores psicossociais",
    "conformidade": "100% de conformidade com NR-1 e ISO 45001"
  },
  "legislacoes": [
    "NR-1 - Disposições Gerais (subitem 1.5.3.4)",
    "ISO 45001:2018 - Sistemas de Gestão de SST",
    "ISO 45003:2021 - Fatores Psicossociais de Risco",
    "NR-17 - Ergonomia",
    "Lei 8.213/91 - Benefícios por Incapacidade"
  ]
}

async function main() {
  console.log('🌱 Iniciando seed do checklist SST - PDCA...')

  try {
    // Buscar uma organização existente ou criar uma de teste
    let organization = await prisma.organization.findFirst()
    
    if (!organization) {
      console.log('📋 Criando organização de teste...')
      organization = await prisma.organization.create({
        data: {
          name: 'Organização de Teste SST',
          slug: 'org-teste-sst',
          inviteCode: 'SST-TESTE-2024',
          type: 'Empresa',
          numberOfEmployees: '100-500',
          corporateEmail: 'sst@teste.com'
        }
      })
      console.log('✅ Organização criada:', organization.name)
    }

    // Criar projeto do tipo checklist
    console.log('📋 Criando projeto SST - PDCA...')
    const project = await prisma.project.create({
      data: {
        title: checklistData.title,
        slug: 'sst-pdca-checklist',
        type: 'checklist' as ProjectType,
        description: checklistData.description,
        organizationId: organization.id,
        status: 'pending'
      }
    })
    console.log('✅ Projeto criado:', project.title)

    // Criar tarefas para cada fase do PDCA
    let totalTarefas = 0
    
    for (const [phaseKey, phase] of Object.entries(checklistData.phases)) {
      console.log(`📋 Criando tarefas da fase: ${phase.title}`)
      
      for (const tarefaData of phase.tarefas) {
        // Converter prazo para data
        let dataPrevisaoConclusao: Date | null = null
        
        if (tarefaData.prazo !== 'Contínuo') {
          const dias = parseInt(tarefaData.prazo.split(' ')[0])
          dataPrevisaoConclusao = new Date(Date.now() + dias * 24 * 60 * 60 * 1000)
        }

        // Mapear prioridade para status
        let status: TarefaStatus = 'pendente'
        if (tarefaData.prioridade === 'alta') {
          status = 'pendente'
        } else if (tarefaData.prioridade === 'média') {
          status = 'pendente'
        }

        const tarefa = await prisma.tarefa.create({
          data: {
            titulo: tarefaData.titulo,
            descricao: tarefaData.descricao,
            responsavel: tarefaData.responsavel,
            dataInicio: new Date(),
            dataPrevisaoConclusao,
            status,
            projectId: project.id
          }
        })
        
        totalTarefas++
        console.log(`  ✅ Tarefa criada: ${tarefa.titulo}`)
      }
    }

    console.log(`🎉 Seed concluído! Criadas ${totalTarefas} tarefas para o projeto SST - PDCA`)
    console.log(`📊 Projeto ID: ${project.id}`)
    console.log(`🏢 Organização: ${organization.name}`)

    // Exibir resumo das fases
    console.log('\n📋 Resumo das Fases PDCA:')
    for (const [phaseKey, phase] of Object.entries(checklistData.phases)) {
      const tarefasCount = phase.tarefas.length
      console.log(`  ${phase.title}: ${tarefasCount} tarefas`)
    }

    // Exibir metas
    console.log('\n🎯 Metas do Projeto:')
    for (const [key, meta] of Object.entries(checklistData.metas)) {
      console.log(`  • ${meta}`)
    }

    // Exibir legislações
    console.log('\n📚 Legislações Base:')
    checklistData.legislacoes.forEach(leg => {
      console.log(`  • ${leg}`)
    })

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
