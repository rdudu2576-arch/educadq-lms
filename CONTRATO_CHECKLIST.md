# 📋 CHECKLIST DE CONTRATO - EducaDQ

## ⚠️ REGRA OBRIGATÓRIA

Antes de fazer **qualquer commit**, você DEVE passar por este checklist.

Se não passar, o código não pode ser enviado.

---

## 🔐 ALTERAÇÕES NO BACKEND

Se você alterou:
- ❌ Autenticação
- ❌ Rotas tRPC
- ❌ Contratos de retorno
- ❌ Middlewares
- ❌ Estrutura de User
- ❌ Cookies
- ❌ Roles
- ❌ Endpoints

### Você DEVE fazer:

```bash
# 1️⃣ Validar tipos
pnpm verify-contract

# Se falhar, PARE e corrija.
```

### Checklist:

- [ ] Alterei tipos em `shared/types.ts`?
- [ ] Atualizei o frontend para usar os novos tipos?
- [ ] O endpoint tRPC ainda retorna o mesmo contrato?
- [ ] `auth.me` continua funcionando?
- [ ] `auth.login` continua funcionando?
- [ ] Protected routes continuam válidas?
- [ ] Rodei `pnpm verify-contract` e passou?

---

## 🎨 ALTERAÇÕES NO FRONTEND

Se você alterou:
- ❌ Componentes de autenticação
- ❌ Chamadas a tRPC
- ❌ Tipos de User
- ❌ Lógica de login/logout

### Você DEVE fazer:

```bash
# 1️⃣ Verificar se o backend ainda responde igual
pnpm verify-contract

# 2️⃣ Testar login no navegador
```

### Checklist:

- [ ] O backend ainda responde com os mesmos tipos?
- [ ] Rodei `pnpm verify-contract` e passou?
- [ ] Testei login no navegador?
- [ ] Testei logout?
- [ ] Testei redirecionamento baseado em role?

---

## 🚀 ANTES DE FAZER COMMIT

```bash
# 1️⃣ Validar contrato
pnpm verify-contract

# 2️⃣ Se passou, você pode fazer commit
git add .
git commit -m "feat: sua alteração"
```

---

## 📌 TIPOS COMPARTILHADOS (NÃO DUPLICAR)

Estes tipos DEVEM estar em `/shared/types.ts`:

- ✅ `UserRole`
- ✅ `UserProfile`
- ✅ `LoginInput`
- ✅ `RegisterInput`
- ✅ `AuthResponse`
- ✅ `JWTPayload`

Se você vir estes tipos redefinidos em outro lugar, **DELETE**.

---

## 🔍 VALIDAÇÃO AUTOMÁTICA

Se você instalou Husky:

```bash
# Antes de cada commit, isso roda automaticamente:
pnpm verify-contract
```

Se falhar, o commit é bloqueado.

---

## 💡 EXEMPLO: Alterar LoginInput

### ❌ ERRADO

```typescript
// client/src/pages/LoginPage.tsx
interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean; // ← Novo campo
}
```

Backend não sabe disso → Erro.

### ✅ CORRETO

```typescript
// shared/types.ts
export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean; // ← Novo campo
}

// server/domain/users/auth.ts
import { LoginInput } from "@shared/types";
const login = publicProcedure
  .input(LoginInput)
  .mutation(...)

// client/src/pages/LoginPage.tsx
import { LoginInput } from "@shared/types";
const loginMutation = trpc.auth.login.useMutation<LoginInput>();
```

Agora ambos usam o mesmo tipo → Sem erros.

---

## 🛡️ PROTEÇÃO PROFISSIONAL

Se você instalou Husky + pre-commit hook:

```bash
# Isso foi feito automaticamente:
npx husky add .husky/pre-commit "pnpm verify-contract"
```

Agora ninguém consegue fazer commit quebrando contrato.

---

## 📞 SUPORTE

Se `pnpm verify-contract` falhar:

1. Leia a mensagem de erro do TypeScript
2. Procure o tipo duplicado
3. Delete a definição local
4. Importe de `@shared/types`
5. Rode `pnpm verify-contract` novamente

---

**Lembre-se: Backend e Frontend são dois lados do mesmo contrato. Se um muda, o outro deve ser validado automaticamente.**
