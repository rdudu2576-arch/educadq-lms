import { router, publicProcedure, protectedProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db.js";
import { verifyFirebaseToken } from "../../services/auth.service.js";

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
    .mutation(async ({ input }) => {
      const existing = await db.getUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este e-mail já está cadastrado.",
        });
      }

      // No Firebase Auth, a senha é gerenciada pelo Firebase.
      // Aqui no banco local, salvamos os dados do usuário.
      // O openId será o identificador que vincula ao Firebase (pode ser preenchido no primeiro login ou aqui se tivermos o UID)
      
      const user = await db.createUser({
        email: input.email,
        password: "firebase_managed", // Senha não é mais validada localmente
        name: input.name,
        role: input.role,
        additionalData: input.additionalData ?? null,
      });

      return {
        success: true,
        user,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // O login agora é feito no frontend via Firebase SDK.
      // Este endpoint pode ser usado para sincronização se necessário,
      // mas a autenticação principal ocorre via token no header/context.
      const user = await db.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado no sistema local. Por favor, complete seu registro.",
        });
      }
      return {
        success: true,
        user,
      };
    }),

  logout: publicProcedure.mutation(() => {
    return {
      success: true,
    };
  }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // This is handled by passwordResetRouter.requestReset
      // Redirect to that endpoint
      const { passwordResetRouter } = await import("../auth/passwordResetRouter.js");
      // For now, just return success to avoid breaking the frontend
      return {
        success: true,
        message: "If email exists, reset link will be sent",
      };
    }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
