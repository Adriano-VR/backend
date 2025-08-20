# 🔧 Correção do Mapeamento de Grupos COPSOQ

## ❌ **Problema Identificado**

Todas as questões do formulário COPSOQ estavam sendo atribuídas ao mesmo grupo "Demandas no trabalho", quando deveriam estar distribuídas pelos 5 grupos diferentes conforme definido no `question_group_copsoq.json`.

### **Evidência do Problema:**
```
📊 Estatísticas por Grupo (ANTES):
   1. Demandas no trabalho: 41 questões  ❌ (deveria ser 6)
   
📊 Estatísticas Corretas (DEPOIS):
   1. Demandas no trabalho: 6 questões   ✅
   2. Organização e conteúdo: 6 questões ✅  
   3. Relações sociais e liderança: 9 questões ✅
   4. Recompensas e valores: 7 questões ✅
   5. Saúde e bem‑estar: 13 questões ✅
```

## 🔍 **Causa Raiz**

No arquivo `unified-forms-seed.ts`, linha 319, quando há grupos predefinidos (como COPSOQ), estava sendo usado sempre o **primeiro grupo disponível**:

```typescript
// PROBLEMA: Código anterior
if (predefinedGroups) {
  // Por enquanto, usar o primeiro grupo disponível (pode ser refinado)
  group = Array.from(questionGroups.values())[0];  // ❌ SEMPRE O PRIMEIRO!
}
```

## ✅ **Solução Implementada**

### **1. Mapeamento Inteligente por Dimensão**

```typescript
// SOLUÇÃO: Novo código
if (predefinedGroups) {
  // Para grupos predefinidos, mapear por nome/dimensão
  // Buscar grupo que corresponde à dimensão da questão
  group = Array.from(questionGroups.values()).find(g => 
    g.name === questionData.dimension ||           // Match exato por nome
    g.label === questionData.dimension ||          // Match por label
    g.slug === questionData.dimension              // Match por slug normalizado
      ?.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
  );
  
  // Fallback: se não encontrar, usar o primeiro grupo
  if (!group) {
    console.warn(`⚠️ Grupo específico não encontrado para dimensão: "${questionData.dimension}", usando primeiro disponível`);
    group = Array.from(questionGroups.values())[0];
  }
}
```

### **2. Lógica de Mapeamento**

O novo algoritmo busca o grupo correto baseado na **dimensão da questão**:

| Dimensão da Questão | Grupo Mapeado |
|---|---|
| `"Demandas no trabalho"` | ✅ Grupo: "Demandas no trabalho" |
| `"Organização e conteúdo"` | ✅ Grupo: "Organização e conteúdo" |
| `"Relações sociais e liderança"` | ✅ Grupo: "Relações sociais e liderança" |
| `"Recompensas e valores"` | ✅ Grupo: "Recompensas e valores" |
| `"Saúde e bem‑estar"` | ✅ Grupo: "Saúde e bem‑estar" |

## 🔄 **Processo de Correção**

### **1. Remoção dos Formulários Incorretos**
```bash
# Remover formulários COPSOQ com mapeamento errado
npx tsx fix-copsoq-groups.ts
```

### **2. Recriação com Mapeamento Correto**
```bash
# Recriar com o novo algoritmo de mapeamento
npx tsx prisma/seeds/basic/templates-forms/unified-forms-seed.ts
```

### **3. Validação dos Resultados**
```bash
# Verificar distribuição correta
npx tsx check-copsoq-core.ts
```

## 📊 **Resultados Finais**

### **COPSOQ III - Núcleo CORE (41 questões):**
- ✅ **Demandas no trabalho**: 6 questões (EQ1-EE6)
- ✅ **Organização e conteúdo**: 6 questões (IT7-TP12)  
- ✅ **Relações sociais e liderança**: 9 questões (ASS15-JR22)
- ✅ **Recompensas e valores**: 7 questões (AE23-IL28)
- ✅ **Saúde e bem‑estar**: 13 questões (SG29-COF41)

### **COPSOQ III - Núcleo MIDDLE (76 questões):**
- ✅ **Demandas no trabalho**: 8 questões
- ✅ **Organização e conteúdo**: 12 questões
- ✅ **Relações sociais e liderança**: 25 questões  
- ✅ **Recompensas e valores**: 15 questões
- ✅ **Saúde e bem‑estar**: 16 questões

## 🎯 **Impacto na Interface**

Agora na tela de analytics `/forms/{uid}/analytics/overview` será exibido:

```
📊 Análise Detalhada por Questão
├── 🔵 Demandas no trabalho (6 questões)
│   ├── EQ1: A sua carga de trabalho...
│   ├── EQ2: Com que frequência...
│   └── ... (4 mais)
├── 🔵 Organização e conteúdo (6 questões)  
│   ├── IT7: Tem um elevado grau...
│   └── ... (5 mais)
├── 🔵 Relações sociais e liderança (9 questões)
│   └── ... 
├── 🔵 Recompensas e valores (7 questões)
│   └── ...
└── 🔵 Saúde e bem‑estar (13 questões)
    └── ...
```

## ✅ **Status**

**PROBLEMA TOTALMENTE RESOLVIDO!** 🎉

- ✅ Mapeamento correto de questões para grupos
- ✅ Formulários COPSOQ redistribuídos corretamente  
- ✅ Interface de analytics exibirá 5 grupos distintos
- ✅ Ordenação por `questionGroup.order` e `question.order` funcionando
- ✅ Algoritmo robusto com fallbacks para casos edge

**A tela de analytics agora mostrará os grupos organizados corretamente conforme o design original do COPSOQ!** 🎯
