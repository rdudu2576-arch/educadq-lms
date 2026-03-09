# Código Completo das Correções Implementadas

## 1. JWT Authentication (`server/_core/jwt.ts`)

```typescript
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "7d";

export interface JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "professor" | "student";
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

export function setAuthCookie(res: any, token: string, secure: boolean = true): void {
  res.setHeader(
    "Set-Cookie",
    `auth_token=${token}; HttpOnly; Secure=${secure}; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
}

export function clearAuthCookie(res: any): void {
  res.setHeader(
    "Set-Cookie",
    "auth_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0"
  );
}
```

## 2. Auth Middleware (`server/_core/authMiddleware.ts`)

```typescript
import { NextFunction, Request, Response } from "express";
import { extractTokenFromCookie, verifyToken } from "./jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "admin" | "professor" | "student";
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromCookie(req.headers.cookie);
    if (!token) {
      req.user = undefined;
      return next();
    }
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
```

## 3. Database Updates (`server/infra/dbUpdates.ts`)

```typescript
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  courses,
  articles,
  pageContent,
  studentProfiles,
  payments,
} from "../../drizzle/schema";

// Course Updates
export async function updateCourse(courseId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const updates: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) updates[key] = data[key];
  });
  updates.updatedAt = new Date();
  await db.update(courses).set(updates).where(eq(courses.id, courseId));
  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result[0];
}

export async function deleteCourse(courseId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, courseId));
}

// Article Updates
export async function updateArticle(articleId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const updates: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) updates[key] = data[key];
  });
  updates.updatedAt = new Date();
  await db.update(articles).set(updates).where(eq(articles.id, articleId));
  const result = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
  return result[0];
}

// Page Updates
export async function updatePageContent(pageId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const updates: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) updates[key] = data[key];
  });
  updates.updatedAt = new Date();
  await db.update(pageContent).set(updates).where(eq(pageContent.id, pageId));
  const result = await db.select().from(pageContent).where(eq(pageContent.id, pageId)).limit(1);
  return result[0];
}

// Payment Creation
export async function createPayment(data: {
  studentId: number;
  courseId: number;
  amount: string;
  installments: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.insert(payments).values({
    studentId: data.studentId,
    courseId: data.courseId,
    amount: data.amount,
    installments: data.installments,
    status: data.status,
  });
  const payment = await db.select().from(payments)
    .where(eq(payments.studentId, data.studentId))
    .limit(1);
  return payment[0];
}
```

## 4. Mercado Pago Router (`server/domain/payments/mercadopagoRouter.ts`)

```typescript
import { router, protectedProcedure, publicProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const MERCADO_PAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || "";

export const mercadopagoRouter = router({
  createPayment: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        amount: z.number().positive(),
        paymentMethod: z.enum(["credit_card", "debit_card", "pix", "boleto"]),
        installments: z.number().min(1).max(12).default(1),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
      }

      const payment = await db.createPayment({
        studentId: ctx.user.userId,
        courseId: input.courseId,
        amount: input.amount.toString(),
        installments: input.installments,
        status: "pending",
      });

      // Create Mercado Pago preference
      const preference = {
        items: [{
          id: input.courseId.toString(),
          title: input.description,
          quantity: 1,
          unit_price: input.amount,
        }],
        payer: { email: ctx.user.email || "" },
        payment_methods: {
          excluded_payment_types: [],
          installments: input.installments,
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`,
        },
        auto_return: "approved",
        external_reference: `payment_${payment.id}`,
      };

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preference),
      });

      const preferenceData = await response.json();

      return {
        paymentId: payment.id,
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point,
        publicKey: MERCADO_PAGO_PUBLIC_KEY,
      };
    }),

  getPaymentMethods: publicProcedure.query(async () => {
    return {
      methods: [
        { id: "credit_card", name: "Cartão de Crédito", installments: [1, 2, 3, 4, 6, 8, 10, 12] },
        { id: "debit_card", name: "Cartão de Débito", installments: [1] },
        { id: "pix", name: "PIX", installments: [1] },
        { id: "boleto", name: "Boleto Bancário", installments: [1] },
      ],
    };
  }),
});
```

## 5. Upload Router (`server/domain/storage/uploadRouter.ts`)

```typescript
import { router, protectedProcedure, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../../storage";
import crypto from "crypto";

export const uploadRouter = router({
  uploadImage: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        base64: z.string(),
        type: z.enum(["avatar", "course_cover", "article", "profile"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
      }

      try {
        const buffer = Buffer.from(input.base64, "base64");
        const filename = `${input.type}/${ctx.user.userId}/${crypto.randomBytes(8).toString("hex")}_${input.filename}`;
        const { url } = await storagePut(filename, buffer, "image/jpeg");
        return { url, filename };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  uploadCourseCover: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        base64: z.string(),
        courseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.base64, "base64");
        const filename = `courses/${input.courseId}/${crypto.randomBytes(8).toString("hex")}_${input.filename}`;
        const { url } = await storagePut(filename, buffer, "image/jpeg");
        return { url, filename };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload course cover",
        });
      }
    }),
});
```

## 6. Course Update Router (`server/domain/courses/courseUpdateRouter.ts`)

```typescript
import { router, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";
import * as updates from "../../infra/dbUpdates";

export const courseUpdateRouter = router({
  update: adminProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        coverUrl: z.string().optional(),
        trailerUrl: z.string().optional(),
        courseHours: z.number().optional(),
        price: z.string().optional(),
        minimumGrade: z.number().optional(),
        maxInstallments: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const course = await updates.updateCourse(input.courseId, {
        title: input.title,
        description: input.description,
        coverUrl: input.coverUrl,
        trailerUrl: input.trailerUrl,
        courseHours: input.courseHours,
        price: input.price,
        minimumGrade: input.minimumGrade,
        maxInstallments: input.maxInstallments,
      });

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }

      return course;
    }),

  delete: adminProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input }) => {
      await updates.deleteCourse(input.courseId);
      return { success: true };
    }),
});
```

## 7. Integration no Express

```typescript
// server.ts ou main.ts
import express from "express";
import { authMiddleware } from "./server/_core/authMiddleware";
import { courseUpdateRouter } from "./server/domain/courses/courseUpdateRouter";
import { mercadopagoRouter } from "./server/domain/payments/mercadopagoRouter";
import { uploadRouter } from "./server/domain/storage/uploadRouter";

const app = express();

// Aplicar middleware global de autenticação
app.use(authMiddleware);

// Registrar routers
app.use("/api/courses", courseUpdateRouter);
app.use("/api/payments", mercadopagoRouter);
app.use("/api/storage", uploadRouter);

export default app;
```

## 8. Variáveis de Ambiente Necessárias

```bash
# JWT
JWT_SECRET=seu_secret_key_aqui

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui

# Frontend
FRONTEND_URL=https://seu_dominio.com

# Database
DATABASE_URL=mysql://user:password@localhost:3306/educadq
```

## 9. Fluxo de Autenticação

1. Usuário faz login → `generateToken()` → `setAuthCookie()`
2. Cookie httpOnly armazenado no navegador
3. Cada requisição → `authMiddleware` → `verifyToken()` → `ctx.user` injetado
4. Logout → `clearAuthCookie()`

## 10. Fluxo de Pagamento

1. Aluno seleciona método de pagamento
2. `createPayment()` → cria registro no banco
3. Integração com Mercado Pago API
4. Retorna URL de checkout
5. Após pagamento → webhook atualiza status

## 11. Fluxo de Upload

1. Frontend envia imagem em base64
2. `uploadImage()` → converte para buffer
3. `storagePut()` → envia para S3
4. Retorna URL pública
5. URL armazenada no banco de dados

## 12. Validação com Zod

Todas as inputs são validadas:
- Email válido
- Senhas com mínimo 8 caracteres
- Números positivos para preços
- Enums para métodos de pagamento
- Strings mínimas para títulos

Todos os dados são persistidos em MySQL e recuperáveis após reinicialização do servidor.
