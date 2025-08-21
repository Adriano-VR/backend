# Correção do OAuth Callback - Problema de Profile Não Encontrado

## Problema Identificado

O erro estava ocorrendo quando um usuário fazia login via Google OAuth e:
1. O usuário existia no Supabase Auth mas não tinha um profile correspondente no banco de dados
2. Existia um profile com o mesmo email mas com ID diferente do usuário que estava fazendo login

O erro específico era:
```
PrismaClientKnownRequestError: Invalid `prisma.profile.update()` invocation:
An operation failed because it depends on one or more records that were required but not found. No record was found for an update.
```

## Solução Implementada

### Modificações no `AuthService.handleOAuthCallback()`

A lógica foi reescrita para lidar com os seguintes cenários:

1. **Profile encontrado por ID**: Usa o profile existente
2. **Profile não encontrado por ID, mas encontrado por email**: Cria um novo profile (não tenta atualizar o existente)
3. **Nenhum profile encontrado**: Cria um novo profile

### Fluxo de Execução

```typescript
// 1. Buscar profile por ID do usuário
let user = await this.profileRepository.findById(dto.user.id);

if (!user) {
  // 2. Se não encontrou por ID, buscar por email
  const existingProfileByEmail = await this.profileRepository.findByEmail(dto.user.email!);
  
  if (existingProfileByEmail) {
    // 3. Se existe profile com o mesmo email mas ID diferente, criar um novo
    user = await this.profileRepository.create({
      // ... dados do novo profile
    });
  }
}

// 4. Se ainda não tem user, criar um novo profile
if (!user) {
  user = await this.profileRepository.create({
    // ... dados do novo profile
  });
}
```

### Melhorias Implementadas

1. **Logs coloridos e emojis**: Adicionados logs detalhados para facilitar o debug
2. **Tratamento de slug único**: Geração de slug único com timestamp quando necessário
3. **Tratamento de erros**: Try-catch para criação de membros da organização
4. **Validação final**: Verificação se o profile foi criado/encontrado antes de retornar

### Cenários Cobertos

- ✅ Usuário novo (sem profile)
- ✅ Usuário existente com profile
- ✅ Usuário com email existente mas ID diferente
- ✅ Conflito de slug (resolvido com timestamp)
- ✅ Criação de membro da organização (com tratamento de erro)

## Testes

Foi criado um script de teste (`scripts/test-oauth-callback.ts`) que simula os diferentes cenários para validar a lógica.

## Impacto

- **Antes**: Erro 500 quando usuário não tinha profile
- **Depois**: Criação automática de profile quando necessário
- **Logs**: Melhor visibilidade do processo de autenticação
- **Robustez**: Sistema mais resiliente a diferentes cenários de login

## Arquivos Modificados

- `src/auth/auth.service.ts`: Lógica principal do OAuth callback
- `scripts/test-oauth-callback.ts`: Script de teste
- `docs/oauth-callback-fix.md`: Esta documentação


