import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateToken, setAuthCookie, clearAuthCookie } from "../../_core/jwt";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        role: z.enum(["admin", "professor", "student"]).default("student"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db.getUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await db.createUser({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role === "student" ? "user" : input.role,
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email || "",
        role: user.role as any,
      });

      setAuthCookie(ctx.res, token);

      return { userId: user.id, email: user.email || "", role: user.role };
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
          message: "Invalid credentials",
        });
      }

      if (!user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const validPassword = await bcrypt.compare(input.password, user.password);
      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email || "",
        role: user.role as any,
      });

      setAuthCookie(ctx.res, token);

      return { userId: user.id, email: user.email || "", role: user.role };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    clearAuthCookie(ctx.res);
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await db.getUserById(ctx.user.id);
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
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await db.updateUser(ctx.user.id, {
        name: input.name,
      });

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
      };
    }),
});
