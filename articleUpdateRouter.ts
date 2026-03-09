import { router, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";

export const articleUpdateRouter = router({
  update: adminProcedure
    .input(
      z.object({
        articleId: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        slug: z.string().optional(),
        featured: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const article = await db.updateArticle(input.articleId, {
        title: input.title,
        content: input.content,
        slug: input.slug,
        featured: input.featured,
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      return article;
    }),

  delete: adminProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteArticle(input.articleId);
      return { success: true };
    }),
});
