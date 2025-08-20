# Sistema de Atualização do Banco de Dados

Este documento explica como usar o sistema principal de atualização do banco de dados do projeto MenteSegura.

## Como Executar

Para abrir o menu principal de atualização do banco, execute:

```bash
pnpm db
```

## Categorias Disponíveis

### 🌱 SEEDS BÁSICOS
- **Seed Básico (Templates)**: Executa seed dos templates de formulários
- **Seed Formulários**: Executa seed específico dos formulários  
- **Seed Cursos**: Executa seed dos cursos

### 👥 SEEDS DE DEMONSTRAÇÃO
- **Seed Demo Padrão**: Executa seed completo para demonstração
- **Seed Demo Detran**: Executa seed específico para demo do Detran
- **Seed Formulários Submetidos**: Executa seed de formulários já submetidos

### 🏢 ORGANIZAÇÕES E FORMULÁRIOS
- **Formulários Organizacionais**: Disponibiliza formulários para organizações

### 🔧 MANUTENÇÃO DO BANCO
- **Sincronizar Schema**: Sincroniza o schema do Prisma com o banco
- **Regenerar Client**: Regenera o cliente Prisma
- **Executar Migrações**: Executa migrações pendentes

### 🧹 LIMPEZA E RESET
- **Limpar Usuários de Teste**: Remove usuários de teste do Supabase
- **Limpar Banco Completo**: Reset completo do banco de dados ⚠️
- **Reset Completo + Seed**: Reset total com migrações e seed básico ⚠️

### 🔄 EXECUÇÃO MÚLTIPLA
- **Setup Inicial Completo**: Prisma push + Seed básico + Formulários org.
- **Reset e Setup Demo**: Reset + Seed básico + Demo padrão ⚠️
- **Atualização de Schema**: Generate + Push + Migrate

## Recursos de Segurança

- Operações perigosas são marcadas com ⚠️
- Confirmação é solicitada antes de executar operações destrutivas
- Feedback visual durante a execução
- Logs coloridos para acompanhar o progresso

## Exemplo de Uso

```bash
# Executar o sistema
pnpm db

# Escolher categoria "SEEDS BÁSICOS" (opção 1)
1

# Escolher "Seed Básico" (opção 1)  
1

# O sistema executará e mostrará o progresso
```

## Notas Importantes

- Sempre faça backup do banco antes de operações de reset
- Use o "Setup Inicial Completo" para configurar um ambiente novo
- Para desenvolvimento, use "Reset e Setup Demo" para dados de teste
- Operações de manutenção são úteis após mudanças no schema

## Scripts Antigos

Os scripts antigos ainda estão disponíveis via `package.json`:
- `pnpm seed:basic`
- `pnpm seed:demo` 
- `pnpm clear:db`
- etc.

Mas recomendamos usar o novo sistema via `pnpm db` para melhor experiência.
