# Sistema de Papéis e Permissões

## Visão Geral

Sistema completo de gerenciamento de papéis de usuários com hierarquia, permissões granulares e auditoria de mudanças.

## Papéis Disponíveis

### 1. Administrador (admin)
Acesso total ao sistema com permissões para gerenciar todos os aspectos.

**Permissões:**
- `manage_users` - Gerenciar usuários e seus papéis
- `manage_courses` - Criar, editar e deletar cursos
- `manage_professors` - Gerenciar professores
- `view_reports` - Acessar relatórios completos
- `manage_payments` - Gerenciar pagamentos e configurações
- `manage_settings` - Alterar configurações do sistema
- `view_analytics` - Acessar analytics e métricas
- `manage_roles` - Alterar papéis de usuários

**Responsabilidades:**
- Supervisionar toda a plataforma
- Gerenciar usuários e papéis
- Configurar integrações de pagamento
- Visualizar relatórios e analytics
- Gerenciar cursos e conteúdo

---

### 2. Professor (professor)
Acesso para criar e gerenciar cursos, avaliar alunos.

**Permissões:**
- `create_courses` - Criar novos cursos
- `edit_own_courses` - Editar cursos criados por ele
- `view_students` - Visualizar lista de alunos
- `grade_assignments` - Avaliar tarefas e provas
- `view_reports` - Acessar relatórios de seus cursos
- `view_analytics` - Ver analytics de seus cursos

**Responsabilidades:**
- Criar e manter cursos
- Publicar aulas e materiais
- Avaliar alunos
- Responder dúvidas
- Acompanhar progresso dos alunos

---

### 3. Aluno (user)
Acesso para visualizar e participar de cursos.

**Permissões:**
- `view_courses` - Visualizar cursos disponíveis
- `submit_assignments` - Enviar tarefas
- `view_grades` - Visualizar notas
- `download_materials` - Baixar materiais de aula
- `view_progress` - Acompanhar progresso

**Responsabilidades:**
- Assistir aulas
- Enviar tarefas
- Participar de avaliações
- Acompanhar progresso
- Baixar materiais

---

## Hierarquia de Papéis

```
┌─────────────────────────────────────────┐
│         ADMINISTRADOR (admin)           │
│  Acesso total ao sistema                │
└─────────────────────────────────────────┘
            ↓ (pode rebaixar para)
┌─────────────────────────────────────────┐
│         PROFESSOR (professor)           │
│  Gerencia cursos e alunos               │
└─────────────────────────────────────────┘
            ↓ (pode rebaixar para)
┌─────────────────────────────────────────┐
│         ALUNO (user)                    │
│  Acesso a cursos                        │
└─────────────────────────────────────────┘
```

**Regras de Mudança:**
- ✅ Admin pode promover qualquer usuário
- ✅ Admin pode rebaixar qualquer usuário (exceto outro admin)
- ❌ Professor não pode mudar papéis
- ❌ Aluno não pode mudar papéis
- ❌ Nenhum admin pode rebaixar outro admin

---

## Mudança de Papéis

### Promoção

```typescript
// Promover aluno para professor
await updateUserRole({
  userId: 123,
  newRole: "professor",
  reason: "Qualificado para ensinar",
  changedBy: 1, // ID do admin
});

// Promover professor para admin
await updateUserRole({
  userId: 123,
  newRole: "admin",
  reason: "Promovido a gerente",
  changedBy: 1,
});
```

### Rebaixamento

```typescript
// Rebaixar professor para aluno
await updateUserRole({
  userId: 123,
  newRole: "user",
  reason: "Fim de contrato",
  changedBy: 1,
});

// Rebaixar admin para professor
await updateUserRole({
  userId: 123,
  newRole: "professor",
  reason: "Mudança de responsabilidades",
  changedBy: 1,
});
```

---

## Auditoria de Mudanças

Todas as mudanças de papel são registradas com:

- **ID do Usuário**: Quem foi alterado
- **Papel Anterior**: Qual era o papel antes
- **Papel Novo**: Qual é o papel agora
- **Motivo**: Por que foi alterado
- **Alterado Por**: Quem fez a mudança (ID do admin)
- **Data/Hora**: Quando foi alterado

### Exemplo de Registro

```json
{
  "userId": 123,
  "oldRole": "user",
  "newRole": "professor",
  "reason": "Qualificado para ensinar",
  "changedBy": 1,
  "changedAt": "2026-03-08T12:30:00Z"
}
```

### Visualizar Histórico

```typescript
const history = await getRoleChangeHistory(userId);

// Retorna:
// [
//   {
//     userId: 123,
//     oldRole: "user",
//     newRole: "professor",
//     reason: "Qualificado para ensinar",
//     changedBy: 1,
//     changedAt: "2026-03-08T12:30:00Z"
//   },
//   ...
// ]
```

---

## API de Gerenciamento

### Listar Usuários

```typescript
GET /api/trpc/userManagement.listUsers
{
  role?: "admin" | "professor" | "user",
  search?: string,
  limit?: 50,
  offset?: 0
}

// Resposta:
{
  users: [
    {
      id: 1,
      name: "João",
      email: "joao@example.com",
      role: "professor",
      createdAt: "2026-03-08T12:00:00Z",
      updatedAt: "2026-03-08T12:00:00Z"
    }
  ],
  total: 100,
  limit: 50,
  offset: 0
}
```

### Obter Detalhes do Usuário

```typescript
GET /api/trpc/userManagement.getUserDetails
{ userId: 123 }

// Resposta:
{
  id: 123,
  name: "João Silva",
  email: "joao@example.com",
  role: "professor",
  cpf: "123.456.789-00",
  phone: "(41) 98891-3431",
  address: "Rua A, 123",
  city: "Curitiba",
  state: "PR",
  zip: "80000-000",
  createdAt: "2026-03-08T12:00:00Z",
  updatedAt: "2026-03-08T12:00:00Z",
  permissions: [
    "create_courses",
    "edit_own_courses",
    "view_students",
    "grade_assignments",
    "view_reports",
    "view_analytics"
  ]
}
```

### Atualizar Papel

```typescript
POST /api/trpc/userManagement.updateUserRole
{
  userId: 123,
  newRole: "professor",
  reason: "Qualificado para ensinar"
}

// Resposta:
{
  success: true,
  message: "User role updated to professor",
  userId: 123,
  newRole: "professor"
}
```

### Promover para Admin

```typescript
POST /api/trpc/userManagement.promoteToAdmin
{ userId: 123 }

// Resposta:
{
  success: true,
  message: "User promoted to admin",
  userId: 123
}
```

### Rebaixar Admin para Professor

```typescript
POST /api/trpc/userManagement.demoteAdminToProfessor
{ userId: 123 }

// Resposta:
{
  success: true,
  message: "Admin demoted to professor",
  userId: 123
}
```

### Rebaixar Professor para Aluno

```typescript
POST /api/trpc/userManagement.demoteProfessorToStudent
{ userId: 123 }

// Resposta:
{
  success: true,
  message: "Professor demoted to student",
  userId: 123
}
```

### Obter Estatísticas

```typescript
GET /api/trpc/userManagement.getUserStats

// Resposta:
{
  admin: 2,
  professor: 5,
  student: 150,
  total: 157
}
```

### Obter Histórico de Mudanças

```typescript
GET /api/trpc/userManagement.getRoleChangeHistory
{ userId: 123 }

// Resposta:
{
  userId: 123,
  changes: [
    {
      userId: 123,
      oldRole: "user",
      newRole: "professor",
      reason: "Qualificado para ensinar",
      changedBy: 1,
      changedAt: "2026-03-08T12:30:00Z"
    }
  ]
}
```

### Buscar Usuário por Email

```typescript
GET /api/trpc/userManagement.searchUserByEmail
{ email: "joao@example.com" }

// Resposta:
{
  id: 123,
  name: "João Silva",
  email: "joao@example.com",
  role: "professor"
}
```

### Obter Permissões do Papel

```typescript
GET /api/trpc/userManagement.getRolePermissions
{ role: "professor" }

// Resposta:
{
  role: "professor",
  permissions: [
    "create_courses",
    "edit_own_courses",
    "view_students",
    "grade_assignments",
    "view_reports",
    "view_analytics"
  ]
}
```

---

## Dashboard Admin

O painel de gerenciamento de usuários oferece:

### Funcionalidades

- ✅ Visualizar todos os usuários
- ✅ Filtrar por papel (admin, professor, aluno)
- ✅ Buscar por nome ou email
- ✅ Alterar papel do usuário
- ✅ Promover usuário
- ✅ Rebaixar usuário
- ✅ Visualizar histórico de mudanças
- ✅ Estatísticas de usuários por papel

### Estatísticas Exibidas

- Total de administradores
- Total de professores
- Total de alunos
- Total geral de usuários

### Ações Disponíveis

Para cada usuário, o admin pode:

1. **Alterar Papel** - Abrir diálogo para escolher novo papel
2. **Promover** - Promover para papel superior (↑)
3. **Rebaixar** - Rebaixar para papel inferior (↓)
4. **Visualizar Histórico** - Ver todas as mudanças de papel
5. **Buscar** - Localizar usuários específicos

---

## Validação e Segurança

### Validações

- ✅ Apenas admins podem mudar papéis
- ✅ Admin não pode rebaixar outro admin
- ✅ Não permitir mudança para o mesmo papel
- ✅ Validar email único
- ✅ Validar dados obrigatórios

### Segurança

- ✅ Todas as mudanças são auditadas
- ✅ Motivo da mudança é registrado
- ✅ Quem fez a mudança é registrado
- ✅ Data/hora da mudança é registrada
- ✅ Histórico completo é mantido
- ✅ Permissões são verificadas em cada ação

---

## Casos de Uso

### Caso 1: Promover Aluno para Professor

```
1. Admin acessa painel de usuários
2. Busca aluno "João Silva"
3. Clica em "Alterar Papel"
4. Seleciona "Professor"
5. Adiciona motivo: "Qualificado para ensinar"
6. Confirma mudança
7. Sistema registra auditoria
8. João agora tem acesso a criar cursos
```

### Caso 2: Rebaixar Professor para Aluno

```
1. Admin acessa painel de usuários
2. Filtra por "Professor"
3. Encontra "Maria Silva"
4. Clica em "Rebaixar"
5. Confirma rebaixamento
6. Sistema registra auditoria
7. Maria perde acesso a criar cursos
8. Maria continua tendo acesso aos cursos que estava assistindo
```

### Caso 3: Promover Professor para Admin

```
1. Admin acessa painel de usuários
2. Busca professor "Pedro Santos"
3. Clica em "Alterar Papel"
4. Seleciona "Administrador"
5. Adiciona motivo: "Promovido a gerente"
6. Confirma mudança
7. Sistema registra auditoria
8. Pedro agora tem acesso total ao sistema
```

---

## Troubleshooting

### Não consigo mudar o papel de um usuário

**Possíveis causas:**
1. Você não é admin
2. Tentando rebaixar outro admin
3. Selecionando o mesmo papel atual
4. Erro de conexão com banco de dados

**Solução:**
- Verificar se você é admin
- Não tentar rebaixar outro admin
- Selecionar um papel diferente
- Tentar novamente

### O histórico de mudanças não aparece

**Possíveis causas:**
1. Nenhuma mudança foi feita ainda
2. Histórico foi limpo
3. Erro ao buscar dados

**Solução:**
- Fazer uma mudança de papel
- Aguardar alguns segundos
- Recarregar a página

### Erro ao atualizar papel

**Possíveis causas:**
1. Usuário não existe
2. Papel inválido
3. Erro de permissão
4. Erro de banco de dados

**Solução:**
- Verificar se o usuário existe
- Verificar se o papel é válido
- Verificar permissões de admin
- Contatar suporte técnico

---

## Próximos Passos

1. **Implementar Bloqueio de Conta** - Adicionar opção para bloquear/desbloquear usuários
2. **Implementar Suspensão Temporária** - Suspender usuário por período determinado
3. **Implementar Papéis Customizados** - Permitir criar papéis personalizados
4. **Implementar Permissões Granulares** - Permitir permissões específicas por usuário
5. **Implementar Auditoria Completa** - Registrar todas as ações do sistema
