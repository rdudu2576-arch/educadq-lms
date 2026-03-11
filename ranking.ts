import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const rankingRouter = router({
  // Get public ranking (only users with active subscriptions)
  getPublicRanking: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return db.getRanking(input.limit, input.offset);
    }),

  // Get student's own profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.getOrCreateStudentProfile(ctx.user.id);
    return profile;
  }),

  // Update student profile
  updateMyProfile: protectedProcedure
    .input(
      z.object({
        publicName: z.string().optional(),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await db.updateStudentProfile(ctx.user.id, input);
      return profile;
    }),

  // Get student's subscription status
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getActiveSubscription(ctx.user.id);
    const profile = await db.getStudentProfile(ctx.user.id);

    return {
      hasActiveSubscription: !!subscription,
      subscription,
      profile,
      isPublic: profile?.isPublic || false,
    };
  }),

  // Get subscription history
  getSubscriptionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      return db.getSubscriptionHistory(ctx.user.id, input.limit);
    }),

  // Create subscription payment (R$20/year)
  createSubscription: protectedProcedure
    .input(
      z.object({
        method: z.enum(["pix", "credit_card", "debit_card"]),
        transactionGateway: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Create subscription payment
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const result = await db.createSubscriptionPayment({
        userId: ctx.user.id,
        amount: "20.00",
        status: "pending",
        method: input.method,
        transactionGateway: input.transactionGateway,
        expirationDate,
      });

      // Log audit event
      await db.createAuditLog({
        event: "subscription_created",
        userId: ctx.user.id,
        description: `Subscription created via ${input.method}`,
        severity: "low",
      });

      return result;
    }),

  // Confirm subscription payment (webhook from payment gateway)
  confirmSubscription: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        status: z.enum(["completed", "failed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const history = await db.getSubscriptionHistory(ctx.user.id, 1);
      if (!history.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      const subscription = history[0];

      if (input.status === "completed") {
        // Activate public profile
        await db.activatePublicProfile(ctx.user.id);

        // Log audit event
        await db.createAuditLog({
          event: "subscription_confirmed",
          userId: ctx.user.id,
          description: `Subscription confirmed - Transaction: ${input.transactionId}`,
          severity: "low",
        });

        return { success: true, message: "Subscription activated!" };
      } else {
        // Log failed payment
        await db.createAuditLog({
          event: "subscription_failed",
          userId: ctx.user.id,
          description: `Subscription payment failed - Transaction: ${input.transactionId}`,
          severity: "medium",
        });

        return { success: false, message: "Payment failed" };
      }
    }),

  // Admin: Get all subscriptions
  getAllSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // This would need a db function to get all subscriptions
    return [];
  }),

  // Admin: Get fraud alerts
  getFraudAlerts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        isBlocked: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.getFraudAlerts({
        isBlocked: input.isBlocked,
        limit: input.limit,
      });
    }),

  // Admin: Get audit logs
  getAuditLogs: protectedProcedure
    .input(
      z.object({
        event: z.string().optional(),
        severity: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.getAuditLogs(input);
    }),

  // Admin: Block user account
  blockUserAccount: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.blockUserAccount(input.userId, input.reason);

      return { success: true, message: "User account blocked" };
    }),

  // Admin: Resolve fraud alert
  resolveFraudAlert: protectedProcedure
    .input(
      z.object({
        fraudId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.resolveFraudAlert(input.fraudId, ctx.user.id);

      return { success: true, message: "Fraud alert resolved" };
    }),

  // Get integrity check status (admin only)
  getIntegrityStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return db.getAllIntegrityChecks();
  }),
});
