import { router, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";

export const pageUpdateRouter = router({
  update: adminProcedure
    .input(
      z.object({
        pageId: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        slug: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const page = await db.updatePageContent(input.pageId, {
        title: input.title,
        content: input.content,
        slug: input.slug,
      });

      if (!page) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Page not found",
        });
      }

      return page;
    }),

  delete: adminProcedure
    .input(z.object({ pageId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deletePageContent(input.pageId);
      return { success: true };
    }),
});
