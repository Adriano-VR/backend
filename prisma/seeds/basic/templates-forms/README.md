# 📋 Seeds de Formulários - Estrutura Unificada

## 🎯 Objetivo

Este diretório contém os seeds para criação de formulários template no sistema MenteSegura, **garantindo que TODOS os formulários tenham grupos de questões**.

## 📁 Estrutura Atual

```
templates-forms/
├── unified-forms-seed.ts          # 🚀 Script unificado (USAR ESTE)
├── form_*.json                    # 📄 Arquivos de dados dos formulários
└── README.md                      # 📚 Esta documentação

../question_groups/
├── question_group_dass21.json     # 👥 Grupos para DASS-21
├── question_group_qs.json # 👥 Grupos para formulário espiritual
└── question_group_copsoq.json     # 👥 Grupos para COPSOQ
```

## 🔄 Como Funciona o Script Unificado

### 1. **Sempre com Grupos** 🏷️
- TODOS os formulários são criados COM grupos de questões
- Nunca cria formulários sem grupos

### 2. **Estratégia de Grupos** 📊

#### A. Grupos Predefinidos
Para formulários que têm arquivos de grupos específicos:
- `form_dass21` → usa `question_group_dass21.json`
- `form_qs` → usa `question_group_qs.json`
- `form_copsoq_*` → usa `question_group_copsoq.json`

#### B. Grupos Automáticos
Para formulários sem grupos predefinidos:
- **Múltiplas dimensões/categorias**: cria um grupo para cada dimensão
- **Dimensão única**: cria um grupo padrão "Questões Gerais"

### 3. **Tipos de Formulário Suportados** 📝

#### Formato Core
```json
{
  "slug": "form_exemplo",
  "title": "Título do Formulário",
  "questions": [
    {
      "code": "EX01",
      "dimension": "Dimensão",
      "text": "Pergunta...",
      "type": "scale_frequency",
      "options": [...]
    }
  ]
}
```

#### Formato Psicológico
```json
{
  "slug": "form_exemplo",
  "titulo": "Título do Formulário",
  "questions": [
    {
      "codigo": "EX01",
      "categoria": "Categoria",
      "label": "Pergunta...",
      "tipo": "radio",
      "opcoes": [...]
    }
  ]
}
```

## 🚀 Como Usar

### Executar o Seed
```bash
cd /mentesegura/apps/backend
pnpm run seed:forms-unified
```

### Ou executar diretamente
```bash
npx ts-node prisma/seeds/basic/templates-forms/unified-forms-seed.ts
```

## ✅ Benefícios da Nova Estrutura

1. **Consistência**: Todos os formulários têm grupos
2. **Simplicidade**: Um único script para todos os formulários
3. **Flexibilidade**: Suporta grupos predefinidos e automáticos
4. **Manutenibilidade**: Código centralizado e organizado
5. **Segurança**: Não duplica formulários existentes

## 📋 Formulários Processados

| Arquivo | Tipo | Grupos | Status |
|---------|------|--------|--------|
| `form_qs.json` | Core | Predefinido (espiritual) | ✅ |
| `form_dass21.json` | Core | Predefinido (DASS-21) | ✅ |
| `form_copsoq_core.json` | Core | Predefinido (COPSOQ) | ✅ |
| `form_copsoq_middle.json` | Core | Predefinido (COPSOQ) | ✅ |
| `form_copsoq_long.json` | Core | Predefinido (COPSOQ) | ✅ |
| `form_who5.json` | Psych | Automático (categoria única) | ✅ |

## 🔧 Adicionar Novo Formulário

1. **Colocar arquivo JSON** na pasta `templates-forms/`
2. **Se precisar de grupos específicos**:
   - Criar arquivo na pasta `../question_groups/`
   - Adicionar mapeamento no script `unified-forms-seed.ts`
3. **Executar o seed** novamente

## 🗑️ Scripts Removidos

Os seguintes scripts foram **removidos** pois foram consolidados no script unificado:
- ❌ `templates-simple-seed.ts`
- ❌ `templates-with-groups-seed.ts`
- ❌ `form-mock-seed.ts`
- ❌ `form-qs.ts`
- ❌ `copsoq-forms-seed.ts`

## ✅ Status Final

- ✅ Script unificado criado e testado
- ✅ Todos os formulários agora têm grupos de questões
- ✅ Estrutura reorganizada com pasta `@question_groups/`
- ✅ Scripts duplicados removidos
- ✅ Build do projeto funciona corretamente

## 🎯 Resultado

**TODOS OS 11 FORMULÁRIOS TEMPLATE AGORA TÊM GRUPOS DE QUESTÕES!**

O sistema agora é consistente e segue a estratégia unificada onde nenhum formulário é criado sem grupos.
