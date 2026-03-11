import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getUserById, updateUserRole, updateUserProfile } from "../db";
import { z } from "zod";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "../../shared/const";

export const authRouter = router({
  /**
   * Get current user
   */
  me: publicProcedure.query(({ ctx }) => ctx.user),

  /**
   * Get user by ID (admin only)
   */
  getUserById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
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
    .mutation(async ({ input, ctx }) => {
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
    .mutation(async ({ input, ctx }) => {
      const updated = await updateUserProfile(ctx.user.id, input);
      return updated;
    }),

  /**
   * Logout
   */