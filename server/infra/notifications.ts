import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc.js";
import { z } from "zod";
import { getDb } from "./db.js";
import { notifications } from "../infra/schema.pg.js";
import { eq, and } from "drizzle-orm";

export const notificationsRouter = router({
  /**
   * Get notifications for current user
   */
  getMyNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user!.id))
        .orderBy(notifications.createdAt)
        .limit(input.limit)
        .offset(input.offset);

      return userNotifications;
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const notificationRows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, input.notificationId))
        .limit(1);
      
      const notification = notificationRows[0];

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this notification",
        });
      }

      // Mark as read
      await db
        .update(notifications)
        .set({ isRead: true } as any)
        .where(eq(notifications.id, input.notificationId));

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    await db
      .update(notifications)
      .set({ isRead: true } as any)
      .where(
        and(
          eq(notifications.userId, ctx.user!.id),
          eq(notifications.isRead, false)
        )
      );

    return { success: true };
  }),

  /**
   * Delete notification
   */
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify ownership
      const notificationRows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, input.notificationId))
        .limit(1);
      
      const notification = notificationRows[0];

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      if (notification.userId !== ctx.user!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this notification",
        });
      }

      await db
        .delete(notifications)
        .where(eq(notifications.id, input.notificationId));

      return { success: true };
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user!.id),
          eq(notifications.isRead, false)
        )
      );

    return { unreadCount: result.length };
  }),
});
