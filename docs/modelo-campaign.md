# Modelo Campaign - Documentação

## Visão Geral

O modelo `Campaign` foi criado para gerenciar campanhas organizacionais que podem conter formulários submetidos, projetos e documentos. Uma campanha representa uma iniciativa ou programa com frequência definida (semestral, anual, trimestral, mensal) e pode ser vinculada a organizações específicas.

## Estrutura do Modelo

### Campaign

```typescript
model campaign {
  id                    String           @id @default(uuid())
  name                  String           // Nome da campanha
  description           String?          // Descrição opcional
  frequency             CampaignFrequency @default(semestral) // Frequência da campanha
  startDate             DateTime         // Data de início
  endDate               DateTime?        // Data de término (opcional)
  status                CampaignStatus   @default(active) // Status atual
  organizationId        String?          // ID da organização (opcional)
  createdById           String?          // ID do usuário criador
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  deletedAt             DateTime?        // Soft delete
  
  // Relacionamentos
  organization          organization?    // Organização vinculada
  createdBy             profile?        // Usuário criador
  submittedForms        submittedForm[] // Formulários submetidos
  projects              project[]        // Projetos vinculados
  documents             campaignDocument[] // Documentos da campanha
}
```

### CampaignDocument

```typescript
model campaignDocument {
  id          String    @id @default(uuid())
  name        String    // Nome do documento
  description String?   // Descrição opcional
  fileUrl     String    // URL do arquivo
  fileType    String    // Tipo do arquivo
  fileSize    Int       // Tamanho do arquivo em bytes
  campaignId  String    // ID da campanha
  uploadedById String?  // ID do usuário que fez upload
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft delete
  
  // Relacionamentos
  campaign    campaign  // Campanha vinculada
  uploadedBy  profile? // Usuário que fez upload
}
```

## Enums

### CampaignFrequency

- `semestral` - Campanha semestral
- `anual` - Campanha anual
- `trimestral` - Campanha trimestral
- `mensal` - Campanha mensal

### CampaignStatus

- `active` - Campanha ativa
- `inactive` - Campanha inativa
- `completed` - Campanha concluída
- `cancelled` - Campanha cancelada

## Relacionamentos

### Com SubmittedForms

Uma campanha pode ter múltiplos formulários submetidos:

```typescript
// No modelo submittedForm
campaignId  String?   @map("campaign_id")
campaign    campaign? @relation(fields: [campaignId], references: [id])

// No modelo campaign
submittedForms submittedForm[]
```

### Com Projects

Uma campanha pode ter múltiplos projetos (Preventivo, Contingencial):

```typescript
// No modelo project
campaigns campaign[]

// No modelo campaign
projects project[]
```

### Com Documents

Uma campanha pode ter múltiplos documentos (uploads):

```typescript
// No modelo campaignDocument
campaignId  String    @map("campaign_id")
campaign    campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

// No modelo campaign
documents campaignDocument[]
```

## API Endpoints

### Campaigns

- `POST /campaigns` - Criar nova campanha
- `GET /campaigns` - Listar todas as campanhas
- `GET /campaigns/:id` - Buscar campanha por ID
- `GET /campaigns/:id/stats` - Obter estatísticas da campanha
- `PATCH /campaigns/:id` - Atualizar campanha
- `DELETE /campaigns/:id` - Remover campanha (soft delete)

### Exemplo de Criação

```typescript
const newCampaign = {
  name: "Campanha de Segurança 2024",
  description: "Campanha semestral de conscientização",
  frequency: "semestral",
  startDate: "2024-01-01",
  endDate: "2024-06-30",
  status: "active",
  organizationId: "org-uuid"
};
```

## Funcionalidades

### Estatísticas da Campanha

O endpoint `/campaigns/:id/stats` retorna:

- Total de formulários submetidos
- Total de projetos
- Total de documentos
- Detalhes dos formulários com contagem de respostas
- Detalhes dos projetos com contagem de ações

### Soft Delete

Todas as entidades usam soft delete (campo `deletedAt`), permitindo recuperação de dados se necessário.

### Validações

- Nome obrigatório
- Data de início obrigatória
- Frequência deve ser um dos valores válidos
- Status deve ser um dos valores válidos
- IDs de organização e usuário devem ser UUIDs válidos

## Casos de Uso

1. **Campanhas de Segurança**: Campanhas semestrais para conscientização sobre segurança no trabalho
2. **Campanhas de Saúde Mental**: Campanhas trimestrais para promoção do bem-estar
3. **Campanhas de Compliance**: Campanhas anuais para treinamento e atualização de políticas
4. **Campanhas de Treinamento**: Campanhas mensais para capacitação de colaboradores

## Integração com Frontend

O modelo está preparado para integração com componentes de:

- **Dashboard de Campanhas**: Visualização geral de todas as campanhas
- **Relatórios Dinâmicos**: Gráficos e estatísticas baseados nos dados da campanha
- **Gestão de Documentos**: Upload e organização de arquivos por campanha
- **Acompanhamento de Projetos**: Vinculação de projetos preventivos e contingenciais

## Próximos Passos

1. Implementar componentes de frontend para gestão de campanhas
2. Criar relatórios dinâmicos com gráficos
3. Implementar sistema de upload de documentos
4. Adicionar notificações para campanhas
5. Implementar métricas de performance das campanhas



