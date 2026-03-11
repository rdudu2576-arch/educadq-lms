# JWT + bcrypt Authentication Implementation

## ✅ Implementação Completa

### 1. Dependências Instaladas

```bash
pnpm add bcrypt jsonwebtoken cookie-parser @types/bcrypt @types/jsonwebtoken @types/cookie-parser
```

### 2. Banco de Dados

Tabela `users` com campos:
- `id` (int, autoincrement, primary key)
- `email` (varchar, unique)
- `password` (varchar, hash bcrypt)
- `name` (text)
- `role` (enum: admin | professor | user)
- `openId` (varchar, unique)
- `cpf`, `phone`, `address`, `city`, `state`, `zip`
- `createdAt`, `updatedAt`

### 3. Arquivo: server/services/auth.service.ts

```typescript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDb } from "../infra/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "7d";
const BCRYPT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export interface JWTPayload {
  id: number;
  email: string;
  role: "admin" | "professor" | "user";
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: "admin" | "professor" | "user";
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: "admin" | "professor" | "user";
  };
  token: string;
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      algorithms: ["HS256"],
    });
    return decoded as JWTPayload;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("User password not set");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email!,
    role: user.role as "admin" | "professor" | "user",
  });

  return {
    user: {
      id: user.id,
      email: user.email!,
      name: user.name,
      role: user.role as "admin" | "professor" | "user",
    },
    token,
  };
}

/**
 * Register new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: "user",
    openId,
  });

  const newUserResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const newUser = newUserResult[0];

  if (!newUser) {
    throw new Error("Failed to create user");
  }

  const token = generateToken({
    id: newUser.id,
    email: newUser.email!,
    role: newUser.role as "admin" | "professor" | "user",
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email!,
      name: newUser.name,
      role: newUser.role as "admin" | "professor" | "user",
    },
    token,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Create admin user (for initialization)
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string = "Administrator"
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[Auth] Admin user ${email} already exists`);
    return;
  }

  const hashedPassword = await hashPassword(password);
  const openId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: "admin",
    openId,
  });

  console.log(`[Auth] Admin user created: ${email}`);
}
```

### 4. Arquivo: server/_core/context.ts

```typescript
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken, getUserById } from "../services/auth.service";

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
    // Get token from cookies
    const token = opts.req.cookies?.token;

    if (token) {
      // Verify JWT token
      const payload = verifyToken(token);

      if (payload) {
        // Get user from database
        const dbUser = await getUserById(payload.id);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures
    console.error("[Auth] Context creation error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
```

### 5. Arquivo: server/_core/index.ts (Inicialização do Servidor)

```typescript
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
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

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser()); // Parse cookies

  // Webhook Mercado Pago
  app.post("/webhook/mercadopago", async (req, res) => {
    try {
      const payment = req.body;
      if (payment?.status === "approved" && payment?.user_id && payment?.course_id) {
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

  // Development mode uses Vite, production mode uses static files
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

### 6. Arquivo: server/domain/users/auth.ts (Router tRPC)

```typescript
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { loginUser, registerUser } from "../../services/auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const authRouter = router({
  /**
   * Get current user
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
      cpf: ctx.user.cpf,
      phone: ctx.user.phone,
      createdAt: ctx.user.createdAt,
    };
  }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { user, token } = await loginUser(input.email, input.password);

        // Set token in httpOnly cookie
        ctx.res.cookie("token", token, COOKIE_OPTIONS);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message,
        });
      }
    }),

  /**
   * Register new user
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        name: z.string().min(2, "Name must be at least 2 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { user, token } = await registerUser(input.email, input.password, input.name);

        // Set token in httpOnly cookie
        ctx.res.cookie("token", token, COOKIE_OPTIONS);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    // Clear token cookie
    ctx.res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  }),

  /**
   * Update own profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      try {
        const { updateUserProfile } = await import("../../infra/db");
        const updated = await updateUserProfile(ctx.user.id, input);

        return {
          success: true,
          user: updated,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update profile";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),

  /**
   * Get user by ID (admin only)
   */
  getUserById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view user details",
        });
      }

      try {
        const { getUserById } = await import("../../services/auth.service");
        const user = await getUserById(input.userId);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          cpf: user.cpf,
          phone: user.phone,
          createdAt: user.createdAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user",
        });
      }
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
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user roles",
        });
      }

      try {
        const { updateUserRole } = await import("../../infra/db");
        const updated = await updateUserRole(input.userId, input.role);

        return {
          success: true,
          user: updated,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update role";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
```

### 7. protectedProcedure (server/_core/trpc.ts)

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

## ✅ SDK Removido Completamente

- ❌ Removido: `server/_core/sdk.ts`
- ❌ Removido: `sdk.authenticateRequest()`
- ❌ Removido: Qualquer referência a SDK externo
- ❌ Removido: localStorage para autenticação

## ✅ Variáveis de Ambiente Necessárias

```env
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
NODE_ENV=development
DATABASE_URL=mysql://user:password@localhost:3306/educadq
```

## ✅ Como Criar Admin Inicial

```bash
# Via script
node scripts/create-admin.ts

# Ou direto no banco
INSERT INTO users (email, password, name, role, openId, createdAt, updatedAt) 
VALUES (
  'admin@educadq.com',
  '$2b$10$...hash_bcrypt_aqui...',
  'Administrator',
  'admin',
  'admin_unique_id',
  NOW(),
  NOW()
);
```

## ✅ Fluxo de Autenticação

### Login
1. Cliente envia `email` + `password` para `trpc.auth.login`
2. Servidor verifica credenciais com bcrypt
3. Gera JWT com payload `{ id, email, role }`
4. Define cookie httpOnly com token (7 dias)
5. Retorna dados do usuário

### Verificação
1. Cliente acessa página protegida
2. Context lê token do cookie
3. Verifica JWT com `jwt.verify()`
4. Busca usuário no banco pelo ID
5. Injeta `ctx.user` em procedures

### Logout
1. Cliente chama `trpc.auth.logout`
2. Servidor limpa cookie com `clearCookie()`
3. Cookie é removido do navegador

## ✅ Endpoints tRPC

- `trpc.auth.me` - GET usuário atual
- `trpc.auth.login` - POST login (email + password)
- `trpc.auth.register` - POST registro (email + password + name)
- `trpc.auth.logout` - POST logout
- `trpc.auth.updateProfile` - POST atualizar perfil (protegido)
- `trpc.auth.getUserById` - GET usuário por ID (admin)
- `trpc.auth.updateUserRole` - POST atualizar papel (admin)

## ✅ Segurança

✅ Senhas com hash bcrypt (10 rounds)
✅ JWT com expiração (7 dias)
✅ Cookies httpOnly (não acessível via JS)
✅ Secure flag em produção
✅ SameSite=lax contra CSRF
✅ Validação de email e senha
✅ Proteção de procedures com middlewares
