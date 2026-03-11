import { publicProcedure, protectedProcedure, adminProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { dynamicContent } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../../infra/db";

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
      });
      return result;
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
      const result = await db
        .update(dynamicContent)
        .set({
          title: input.title,
          content: input.content,
          contentType: input.contentType as any,
        })
        .where(eq(dynamicContent.key, input.key));
      return result;
    }),

  // Delete content (admin only)
  deleteContent: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db
        .delete(dynamicContent)
        .where(eq(dynamicContent.key, input.key));
      return result;
    }),
});
