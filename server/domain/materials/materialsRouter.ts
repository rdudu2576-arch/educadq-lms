import { publicProcedure, protectedProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { lessonMaterials } from "../../infra/schema.pg.js";
import { eq } from "drizzle-orm";
import { getDb } from "../../infra/db.js";

export const materialsRouter = router({
  // Get materials for a lesson
  getLessonMaterials: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db
        .select()
        .from(lessonMaterials)
        .where(eq(lessonMaterials.lessonId, input.lessonId));
      return result;
    }),

  // Add material to lesson (professor/admin only)
  addMaterial: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        title: z.string(),
        type: z.enum(["pdf", "document", "spreadsheet", "video", "link"]),
        url: z.string().url(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db.insert(lessonMaterials).values({
        lessonId: input.lessonId,
        title: input.title,
        type: input.type as any,
        url: input.url,
      } as any).returning();

      return result[0];
    }),

  // Delete material
  deleteMaterial: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db
        .delete(lessonMaterials)
        .where(eq(lessonMaterials.id, input.materialId));

      return { success: true };
    }),

  // Update material
  updateMaterial: protectedProcedure
    .input(
      z.object({
        materialId: z.number(),
        title: z.string().optional(),
        url: z.string().url().optional(),
        type: z.enum(["pdf", "document", "spreadsheet", "video", "link"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const { materialId, ...data } = input;
      
      const result = await db
        .update(lessonMaterials)
        .set(data as any)
        .where(eq(lessonMaterials.id, materialId)).returning();

      return result[0];
    }),
});
