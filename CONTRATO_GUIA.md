# 📖 GUIA DE IMPLEMENTAÇÃO - SISTEMA DE CONTRATO

## 🎯 O Que É Este Sistema?

Este é um **sistema de sincronização automática** entre Frontend e Backend.

Quando você altera algo no backend, o frontend é validado automaticamente.
Quando você altera algo no frontend, o backend é validado automaticamente.

Nunca mais você terá:
- ❌ "Backend mudou, frontend não sabe"
- ❌ "Frontend espera campo X, backend não retorna"
- ❌ "Login funcionava, agora não funciona"

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                   shared/types.ts                        │
│  (Verdade Única - User, Auth, Roles, Contratos)        │
└─────────────────────────────────────────────────────────┘
          ↑                                   ↑
          │                                   │
    ┌─────┴──────┐                    ┌──────┴─────┐
    │   Backend   │                    │  Frontend   │
    │  Importa    │                    │  Importa    │
    │  DAQUI      │                    │  DAQUI      │
    └─────┬──────┘                    └──────┬─────┘
          │                                   │
    ┌─────┴──────────────────────────────────┴─────┐
    │  pnpm verify-contract                        │
    │  (Valida tipos + compila tudo)               │
    └──────────────────────────────────────────────┘
```

---

## 📋 Arquivos Principais

### 1. `shared/types.ts`
**Verdade Única** - Todos os tipos compartilhados

```typescript
// ✅ AQUI
export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}
```

### 2. `package.json` - Script de Verificação

```json
{
  "scripts": {
    "verify-contract": "tsc --noEmit && pnpm build"
  }
}
```

### 3. `.husky/pre-commit` - Proteção Automática

```bash
#!/bin/sh
pnpm verify-contract
```

Antes de cada commit, isso roda automaticamente.

### 4. `CONTRATO_CHECKLIST.md` - Guia de Desenvolvimento

Checklist que você deve seguir antes de cada commit.

---

## 🚀 Como Usar

### Cenário 1: Você Alterou o Backend

```typescript
// server/domain/users/auth.ts
// Você quer adicionar um campo novo ao LoginInput

// ❌ ERRADO
const loginRouter = publicProcedure
  .input(z.object({
    email: z.string(),
    password: z.string(),
    rememberMe: z.boolean(), // ← Novo campo local
  }))
```

O frontend não sabe disso → Erro.

### ✅ CORRETO

```typescript
// 1️⃣ Atualizar shared/types.ts
export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean; // ← Novo campo
}

// 2️⃣ Usar em server/domain/users/auth.ts
import { LoginInput } from "@shared/types";

const loginRouter = publicProcedure
  .input(LoginInput)
  .mutation(...)

// 3️⃣ Rodar verificação
pnpm verify-contract

// 4️⃣ Se passou, o frontend já sabe do novo campo
// Ele pode usar rememberMe sem erros de tipo
```

---

### Cenário 2: Você Alterou o Frontend

```typescript
// ❌ ERRADO - Redefinir tipo localmente
interface User {
  id: number;
  email: string;
  name: string;
  // Backend não tem 'name'
}

// ✅ CORRETO - Importar de shared
import { UserProfile } from "@shared/types";

const user: UserProfile = {
  id: 1,
  email: "test@example.com",
  role: "user"
};
```

---

## 🔍 Validação Passo a Passo

### Quando você roda `pnpm verify-contract`:

```bash
$ pnpm verify-contract

# 1️⃣ TypeScript valida tipos
tsc --noEmit
✓ Sem erros de tipo

# 2️⃣ Vite compila frontend
vite build
✓ Frontend compilado

# 3️⃣ esbuild compila backend
esbuild server/_core/index.ts ...
✓ Backend compilado

# Se tudo passou:
✓ Contrato válido - você pode fazer commit
```

Se alguma coisa falhar:

```bash
# Erro de tipo
error TS2339: Property 'rememberMe' does not exist

# Solução:
# 1. Abra shared/types.ts
# 2. Procure LoginInput
# 3. Adicione rememberMe
# 4. Rode pnpm verify-contract novamente
```

---

## 🛡️ Proteção Automática (Husky)

Se você instalou Husky:

```bash
# Antes de fazer commit
git commit -m "feat: adicionar rememberMe"

# Husky roda automaticamente:
pnpm verify-contract

# Se falhar:
# ✗ commit bloqueado
# Você precisa corrigir antes de tentar novamente
```

---

## 📝 Checklist Antes de Commit

Sempre siga este checklist:

```
[ ] Alterei tipos?
    → Atualizei shared/types.ts?

[ ] Alterei backend?
    → Atualizei frontend para usar novos tipos?
    → Rodei pnpm verify-contract?

[ ] Alterei frontend?
    → Backend ainda responde igual?
    → Rodei pnpm verify-contract?

[ ] Tudo passou?
    → Posso fazer commit
```

---

## 🎓 Exemplos Práticos

### Exemplo 1: Adicionar Campo a User

```typescript
// shared/types.ts
export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null; // ← Novo
}

// server/domain/users/auth.ts
import { UserProfile } from "@shared/types";

const me = protectedProcedure.query(({ ctx }) => {
  return {
    id: ctx.user.id,
    email: ctx.user.email,
    name: ctx.user.name,
    role: ctx.user.role,
    phone: ctx.user.phone, // ← Novo
  } as UserProfile;
});

// client/src/pages/Profile.tsx
import { UserProfile } from "@shared/types";

const Profile = () => {
  const { data: user } = trpc.auth.me.useQuery();
  
  return (
    <div>
      <p>{user?.email}</p>
      <p>{user?.phone}</p> {/* ← TypeScript sabe que existe */}
    </div>
  );
};

// Rodar verificação
pnpm verify-contract
✓ Tudo sincronizado
```

### Exemplo 2: Adicionar Novo Endpoint

```typescript
// shared/types.ts
export interface UpdateProfileInput {
  name: string;
  phone: string;
}

// server/domain/users/auth.ts
import { UpdateProfileInput } from "@shared/types";

const updateProfile = protectedProcedure
  .input(UpdateProfileInput)
  .mutation(async ({ input, ctx }) => {
    // Atualizar no banco
    return { success: true };
  });

// client/src/pages/Profile.tsx
import { UpdateProfileInput } from "@shared/types";

const Profile = () => {
  const updateMutation = trpc.auth.updateProfile.useMutation();
  
  const handleUpdate = (data: UpdateProfileInput) => {
    updateMutation.mutate(data);
  };
};

// Rodar verificação
pnpm verify-contract
✓ Tudo sincronizado
```

---

## 🚨 Erros Comuns

### ❌ Erro 1: Tipo Duplicado

```typescript
// shared/types.ts
export interface User { ... }

// client/src/types.ts
interface User { ... } // ← DUPLICADO!

// Solução:
// Delete client/src/types.ts
// Importe de shared/types.ts
```

### ❌ Erro 2: Campo Faltando

```typescript
// Backend retorna
{ id: 1, email: "test@example.com", phone: "123" }

// Frontend espera
interface User {
  id: number;
  email: string;
  // phone faltando!
}

// Solução:
// Atualize shared/types.ts
// Adicione phone
```

### ❌ Erro 3: Tipo Errado

```typescript
// Backend retorna
{ role: "admin" } // string

// Frontend espera
{ role: 1 } // number

// Solução:
// Atualize shared/types.ts
// Defina role como "admin" | "professor" | "user"
```

---

## 💡 Dicas Profissionais

1. **Sempre atualizar shared/types.ts primeiro**
   - Antes de alterar backend ou frontend
   - Isso garante sincronização

2. **Rodar pnpm verify-contract frequentemente**
   - Não espere até o final
   - Quanto antes descobrir, mais fácil corrigir

3. **Usar Husky para proteção automática**
   - Ninguém consegue fazer commit quebrando contrato
   - Economia de tempo em code review

4. **Manter CONTRATO_CHECKLIST.md atualizado**
   - Referência rápida antes de commit
   - Evita erros humanos

---

## 🎯 Resultado Final

Com este sistema:

✅ Backend e Frontend **sempre sincronizados**
✅ Erros de tipo **detectados antes de deploy**
✅ Nenhum "backend mudou, frontend não sabe"
✅ Commits **bloqueados automaticamente** se quebrar contrato
✅ Code review **mais rápido** (tipos já validados)

---

**Lembre-se: Backend e Frontend são dois lados do mesmo contrato. Se um muda, o outro é validado automaticamente.**
