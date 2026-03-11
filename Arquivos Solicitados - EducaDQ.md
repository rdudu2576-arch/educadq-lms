# Arquivos Solicitados - EducaDQ

## 1. server/_core/context.ts

```typescript
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
```

---

## 2. server/_core/trpc.ts

```typescript
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
```

---

## 3. Onde o Servidor é Inicializado: server/_core/index.ts

```typescript
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Webhook Mercado Pago - rota direta Express
  app.post("/webhook/mercadopago", async (req, res) => {
    try {
      const payment = req.body;
      if (payment?.status === "approved" && payment?.user_id && payment?.course_id) {
        // Importa dinamicamente para evitar circular deps
        const { enrollStudent, updatePayment } = await import("../infra/db");
        await enrollStudent(payment.user_id, payment.course_id);
        if (payment.payment_id) {
          await updatePayment(payment.payment_id, { status: "paid", paidAt: new Date() });
        }
        console.log(`[Webhook] Curso ${payment.course_id} liberado para usuario ${payment.user_id}`);
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("[Webhook] Erro ao processar pagamento:", error);
      res.sendStatus(500);
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
```

---

## 4. Implementação Real de auth.logout: server/domain/users/auth.ts

```typescript
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import { getUserById, updateUserRole, updateUserProfile } from "../../infra/db";
import { z } from "zod";
import { getSessionCookieOptions } from "../../_core/cookies";
import { COOKIE_NAME } from "../../../shared/const";

export const authRouter = router({
  /**
   * Get current user
   */
  me: publicProcedure.query(({ ctx }: any) => ctx.user),

  /**
   * Get user by ID (admin only)
   */
  getUserById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view user details",
        });
      }

      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "professor", "user"]),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user roles",
        });
      }

      const updated = await updateUserRole(input.userId, input.role);
      return updated;
    }),

  /**
   * Update own profile
   */
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      cpf: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const updated = await updateUserProfile(ctx.user.id, input);
      return updated;
    }),

  /**
   * Logout - IMPLEMENTAÇÃO REAL
   * Limpa o cookie de sessão e faz logout do usuário
   */
  logout: publicProcedure.mutation(({ ctx }: any) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

    return { success: true };
  }),
});
```

---

## 5. Arquivo de Login: client/src/pages/LoginPage.tsx

```typescript
import SEO from "@/components/SEO";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Loader2, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      // Já está logado, redirecionar para o dashboard apropriado
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/student");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null; // useEffect vai redirecionar
  }

  return (
    <>
    <SEO title="Login" description="Acesse sua conta na plataforma EducaDQ para acessar cursos, aulas e materiais de estudo." />
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md mx-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">EducaDQ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plataforma de Educação a Distância
            </p>
          </div>

          {/* Descrição */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Acesse sua conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Entre para acessar seus cursos, aulas e materiais de estudo.
            </p>
          </div>

          {/* Botão de Login */}
          <a
            href={getLoginUrl()}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Entrar na Plataforma
          </a>

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
```

---

## 6. Implementação de getLoginUrl(): client/src/const.ts

```typescript
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Gera URL de login em tempo de execução
 * Usa o origin atual para garantir que o redirect URI funcione em qualquer ambiente
 * 
 * Fluxo:
 * 1. Obtém URLs do OAuth portal e App ID das variáveis de ambiente
 * 2. Constrói redirect URI usando o origin atual (http://localhost:3000, https://example.com, etc)
 * 3. Codifica redirect URI em base64 para passar como state
 * 4. Constrói URL de login com parâmetros
 * 5. Retorna URL completa para redirecionamento
 * 
 * @returns {string} URL completa de login do OAuth
 */
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
```

---

## 7. Hook useAuth() - client/src/hooks/useAuth.ts

```typescript
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Hook para gerenciar autenticação
 * 
 * Funcionalidades:
 * - Verifica se usuário está autenticado
 * - Fornece função de logout
 * - Redireciona para login se não autenticado (opcional)
 * - Persiste informações do usuário em localStorage
 * 
 * @param options - Opções de configuração
 * @returns Objeto com user, loading, error, isAuthenticated e logout
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
```

---

## Resumo da Arquitetura de Autenticação

### Fluxo de Login

```
1. Usuário acessa /login
2. Clica em "Entrar na Plataforma"
3. getLoginUrl() gera URL com OAuth portal
4. Usuário é redirecionado para OAuth portal
5. Faz login com credenciais
6. OAuth retorna para /api/oauth/callback
7. Callback cria sessão JWT em cookie httpOnly
8. Usuário é redirecionado para dashboard
```

### Fluxo de Logout

```
1. Usuário clica em "Sair"
2. useAuth().logout() é chamado
3. trpc.auth.logout.useMutation() executa
4. Servidor limpa cookie de sessão
5. Frontend invalida cache do usuário
6. Usuário é redirecionado para login
```

### Fluxo de Verificação de Autenticação

```
1. Página carrega
2. useAuth() chama trpc.auth.me.useQuery()
3. Servidor verifica JWT no cookie
4. Retorna dados do usuário ou null
5. Frontend renderiza baseado em user
```

---

## Variáveis de Ambiente Necessárias

```env
# OAuth
VITE_APP_ID=seu_app_id
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# JWT
JWT_SECRET=sua_chave_secreta

# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/educadq
```

---

## Endpoints tRPC de Autenticação

- `trpc.auth.me` - GET usuário atual
- `trpc.auth.logout` - POST fazer logout
- `trpc.auth.getUserById` - GET usuário por ID (admin)
- `trpc.auth.updateUserRole` - POST atualizar papel (admin)
- `trpc.auth.updateProfile` - POST atualizar perfil próprio
