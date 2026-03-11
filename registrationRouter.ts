import { router, publicProcedure, protectedProcedure, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { getDb } from "../../infra/db";
import { TRPCError } from "@trpc/server";
import { registrationFields, userRegistrationData } from "../../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

export const registrationRouter = router({
  // Get all active registration fields for public form
  getFields: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not connected");
      const fields = await db
        .select()
        .from(registrationFields)
        .where(eq(registrationFields.active, true))
        .orderBy(asc(registrationFields.order));

      return fields.map((field) => ({
        ...field,
        options: field.options ? JSON.parse(field.options) : null,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch registration fields",
      });
    }
  }),

  // Get all registration fields (admin only)
  getAllFields: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not connected");
      const fields = await db
        .select()
        .from(registrationFields)
        .orderBy(asc(registrationFields.order));

      return fields.map((field) => ({
        ...field,
        options: field.options ? JSON.parse(field.options) : null,
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch registration fields",
      });
    }
  }),

  // Create new registration field (admin only)
  createField: adminProcedure
    .input(
      z.object({
        label: z.string().min(1),
        type: z.enum(["text", "select", "number", "textarea", "checkbox", "date"]),
        required: z.boolean().default(false),
        order: z.number().int().default(0),
        options: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        
        await db
          .insert(registrationFields)
          .values({
            label: input.label,
            type: input.type,
            required: input.required,
            order: input.order,
            options: input.options ? JSON.stringify(input.options) : null,
            active: true,
          });

        return { success: true, message: "Field created successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create registration field",
        });
      }
    }),

  // Update registration field (admin only)
  updateField: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        label: z.string().min(1).optional(),
        type: z.enum(["text", "select", "number", "textarea", "checkbox", "date"]).optional(),
        required: z.boolean().optional(),
        active: z.boolean().optional(),
        order: z.number().int().optional(),
        options: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        const { id, ...updates } = input;

        await db
          .update(registrationFields)
          .set({
            ...updates,
            options: updates.options ? JSON.stringify(updates.options) : undefined,
          })
          .where(eq(registrationFields.id, id));

        return { success: true, message: "Field updated successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update registration field",
        });
      }
    }),

  // Delete registration field (admin only)
  deleteField: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");
        await db.delete(registrationFields).where(eq(registrationFields.id, input.id));
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete registration field",
        });
      }
    }),

  // Save user registration data
  saveUserData: protectedProcedure
    .input(
      z.object({
        fieldId: z.number().int(),
        value: z.string(),
      })
    )
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
        const existing = await db
          .select()
          .from(userRegistrationData)
          .where(
            eq(userRegistrationData.userId, ctx.user.id) &&
            eq(userRegistrationData.fieldId, input.fieldId)
          )
          .limit(1);

        if (existing.length > 0) {
          // Update
          await db
            .update(userRegistrationData)
            .set({ value: input.value })
            .where(
              eq(userRegistrationData.userId, ctx.user.id) &&
              eq(userRegistrationData.fieldId, input.fieldId)
            );

          return existing[0];
        } else {
          // Create
          await db
            .insert(userRegistrationData)
            .values({
              userId: ctx.user.id,
              fieldId: input.fieldId,
              value: input.value,
            });

          return { id: 0, userId: ctx.user.id, fieldId: input.fieldId, value: input.value, createdAt: new Date(), updatedAt: new Date() };
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save registration data",
        });
      }
    }),

  // Get user's registration data
  getUserData: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not connected");
      const data = await db
        .select()
        .from(userRegistrationData)
        .where(eq(userRegistrationData.userId, ctx.user.id));

      return data;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user registration data",
      });
    }
  }),
});
