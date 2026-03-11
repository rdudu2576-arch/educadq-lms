import { publicProcedure, protectedProcedure, adminProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { dynamicContent } from "../../infra/schema.pg.js";
import { eq } from "drizzle-orm";
import { getDb } from "../../infra/db.js";

export const contentRouter = router({
  // Get content by key (public)
  getContent: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(dynamicContent)
        .where(eq(dynamicContent.key, input.key));
      return result.length ? result[0] : null;
    }),

  // Get all content (admin only)
  getAllContent: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const result = await db.select().from(dynamicContent);
    return result;
  }),

  // Create content (admin only)
  createContent: adminProcedure
    .input(
      z.object({
        key: z.string(),
        title: z.string(),
        content: z.string(),
        contentType: z.enum(["html", "text", "markdown"]).default("html"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db.insert(dynamicContent).values({
        key: input.key,
        title: input.title,
        content: input.content,
        contentType: input.contentType as any,
      } as any).returning();
      return result[0];
    }),

  // Update content (admin only)
  updateContent: adminProcedure
    .input(
      z.object({
        key: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        contentType: z.enum(["html", "text", "markdown"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const { key, ...data } = input;
      
      const result = await db
        .update(dynamicContent)
        .set(data as any)
        .where(eq(dynamicContent.key, key)).returning();
      return result[0];
    }),

  // Delete content (admin only)
  deleteContent: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      await db
        .delete(dynamicContent)
        .where(eq(dynamicContent.key, input.key));
      return { success: true };
    }),
});
