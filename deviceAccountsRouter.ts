import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { getDb } from "../../infra/db";
import { TRPCError } from "@trpc/server";
import { deviceAccounts } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const deviceAccountsRouter = router({
  // Get all saved accounts for current device
  getDeviceAccounts: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        const accounts = await db
          .select({
            id: deviceAccounts.id,
            userId: deviceAccounts.userId,
            lastUsed: deviceAccounts.lastUsed,
            active: deviceAccounts.active,
          })
          .from(deviceAccounts)
          .where(
            and(
              eq(deviceAccounts.deviceId, input.deviceId),
              eq(deviceAccounts.active, true)
            )
          );

        return accounts;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch device accounts",
        });
      }
    }),

  // Save or update device account
  saveDeviceAccount: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        // Check if account already exists
        const existing = await db
          .select()
          .from(deviceAccounts)
          .where(
            and(
              eq(deviceAccounts.deviceId, input.deviceId),
              eq(deviceAccounts.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update last used
          await db
            .update(deviceAccounts)
            .set({ lastUsed: new Date() })
            .where(
              and(
                eq(deviceAccounts.deviceId, input.deviceId),
                eq(deviceAccounts.userId, ctx.user.id)
              )
            );

          return existing[0];
        } else {
          // Check device account limit (max 10)
          const count = await db
            .select()
            .from(deviceAccounts)
            .where(eq(deviceAccounts.deviceId, input.deviceId));

          if (count.length >= 10) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Device account limit reached (max 10)",
            });
          }

          await db
            .insert(deviceAccounts)
            .values({
              userId: ctx.user.id,
              deviceId: input.deviceId,
              lastUsed: new Date(),
              active: true,
            });

          return { id: 0, userId: ctx.user.id, deviceId: input.deviceId, lastUsed: new Date(), active: true, createdAt: new Date() };
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save device account",
        });
      }
    }),

  // Remove device account
  removeDeviceAccount: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        await db.delete(deviceAccounts).where(eq(deviceAccounts.id, input.id));
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove device account",
        });
      }
    }),

  // Deactivate all device accounts for logout
  logoutAllDevices: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        await db
          .update(deviceAccounts)
          .set({ active: false })
          .where(
            and(
              eq(deviceAccounts.deviceId, input.deviceId),
              eq(deviceAccounts.userId, ctx.user.id)
            )
          );

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to logout from all devices",
        });
      }
    }),
});
