import { router, publicProcedure, protectedProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateToken, setAuthCookie, clearAuthCookie } from "../../_core/jwt.js";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db.js";

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        role: z
          .enum(["admin", "professor", "student"])
          .transform((r) => (r === "student" ? "user" : r)),
        additionalData: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // PROBLEMA IDENTIFICADO: O registro de usuários não tinha tratamento de erro adequado.
      // CAUSA RAIZ: Falta de bloco try-catch, o que poderia causar erro 500 sem logs.
      // CORREÇÃO: Adicionado bloco try-catch e logs de depuração.
      // POR QUE RESOLVE: Garante que falhas no banco de dados durante o registro sejam capturadas e logadas.
      try {
        const existing = await db.getUserByEmail(input.email);

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este e-mail já está cadastrado.",
          });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const user = await db.createUser({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role,
          additionalData: input.additionalData ?? null,
        });

        const token = generateToken({
          id: user.id,
          email: user.email!,
          role: user.role,
        });

        setAuthCookie(ctx.res, token);

        console.log(`[Auth] Registro e login bem-sucedido para: ${input.email}`);
        return {
          success: true,
          user,
        };
      } catch (error) {
        console.error("[Auth] Erro crítico no processo de registro:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao processar o registro.",
          cause: error,
        });
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // PROBLEMA IDENTIFICADO: O login falhava com erro 500 sem logs claros no backend.
      // CAUSA RAIZ: Falta de tratamento de erros e logs nas chamadas de banco de dados no roteador.
      // CORREÇÃO: Adicionado bloco try-catch e logs explícitos para capturar erros de conexão ou consulta.
      // POR QUE RESOLVE: Permite identificar se a falha é no banco de dados (como o erro ENOTFOUND) ou nas credenciais.
      try {
        const user = await db.getUserByEmail(input.email);

        if (!user) {
          console.warn(`[Auth] Tentativa de login falhou: usuário não encontrado (${input.email})`);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciais inválidas.",
          });
        }

      const validPassword = user.password ? await bcrypt.compare(
        input.password,
        user.password
      ) : false;

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciais inválidas.",
        });
      }

      const token = generateToken({
        id: user.id,
        email: user.email!,
        role: user.role,
      });

      setAuthCookie(ctx.res, token);

      console.log(`[Auth] Login bem-sucedido para: ${input.email}`);
      return {
        success: true,
        user,
      };
      } catch (error) {
        console.error("[Auth] Erro crítico no processo de login:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno ao processar o login.",
          cause: error,
        });
      }
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    clearAuthCookie(ctx.res);

    return {
      success: true,
    };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // Stub para o endpoint que estava faltando e causando erro no build
      return { success: true, message: "Funcionalidade em implementação" };
    }),
});
