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
       role: z.enum(["admin", "professor", "student"]).transform(r => r === "student" ? "user" : r)
        additionalData: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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

      const token = generateToken(user);

      setAuthCookie(ctx.res, token);

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
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciais inválidas.",
        });
      }

      const validPassword = await bcrypt.compare(
        input.password,
        user.password
      );

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciais inválidas.",
        });
      }

      const token = generateToken(user);

      setAuthCookie(ctx.res, token);

      return {
        success: true,
        user,
      };
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
});
