import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { getDb } from "../../infra/db";
import { TRPCError } from "@trpc/server";
import { passwordResetTokens, users } from "../../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "../../services/emailNotifications";

export const passwordResetRouter = router({
  // Request password reset
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (user.length === 0) {
          // Don't reveal if email exists
          return { success: true, message: "If email exists, reset link will be sent" };
        }

        // Generate reset token
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.insert(passwordResetTokens).values({
          userId: user[0].id,
          token,
          expiresAt,
          used: false,
        });

        // Send email with reset link
        await sendPasswordResetEmail(user[0].email || "", token);

        return { success: true, message: "Password reset link sent to email" };
      } catch (error) {
        console.error("Password reset error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  // Validate reset token
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");

        const resetToken = await db
          .select()
          .from(passwordResetTokens)
          .where(
            and(
              eq(passwordResetTokens.token, input.token),
              eq(passwordResetTokens.used, false),
              gt(passwordResetTokens.expiresAt, new Date())
            )
          )
          .limit(1);

        if (resetToken.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        return { valid: true, token: input.token };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate reset token",
        });
      }
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");

        // Validate token
        const resetToken = await db
          .select()
          .from(passwordResetTokens)
          .where(
            and(
              eq(passwordResetTokens.token, input.token),
              eq(passwordResetTokens.used, false),
              gt(passwordResetTokens.expiresAt, new Date())
            )
          )
          .limit(1);

        if (resetToken.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Update user password
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, resetToken[0].userId));

        // Mark token as used
        await db
          .update(passwordResetTokens)
          .set({ used: true })
          .where(eq(passwordResetTokens.id, resetToken[0].id));

        return { success: true, message: "Password reset successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
        });
      }
    }),

  // Change password (for authenticated users)
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");

        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (user.length === 0 || !user[0].password) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(input.currentPassword, user[0].password);
        if (!validPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        // Update password
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, ctx.user.id));

        return { success: true, message: "Password changed successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
        });
      }
    }),
});
