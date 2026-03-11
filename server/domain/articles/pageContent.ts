import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
import {
  getPageContent,
  getPageContentByKey,
  updatePageContent,
  deletePageContent,
  getAllPageContent,
} from "../../infra/db.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const pageContentRouter = router({
  // Get all content for a specific page (public)
  getByPage: publicProcedure
    .input(z.object({ pageKey: z.string() }))
    .query(async ({ input }) => {
      return await getPageContent(input.pageKey);
    }),

  // Get specific content by keys (public)
  getByKey: publicProcedure
    .input(
      z.object({
        pageKey: z.string(),
        sectionKey: z.string(),
        contentKey: z.string(),
      })
    )
    .query(async ({ input }) => {
      const content = await getPageContentByKey(input.pageKey);
      if (!content) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conteúdo não encontrado",
        });
      }
      return content;
    }),

  // Update content (admin only)
  update: protectedProcedure
    .input(
      z.object({
        pageKey: z.string(),
        sectionKey: z.string(),
        contentKey: z.string(),
        content: z.string(),
        contentType: z.enum(["text", "html", "markdown"]).default("text"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem editar conteúdo",
        });
      }

      const result = await updatePageContent(input.pageKey, {
        sectionKey: input.sectionKey,
        contentKey: input.contentKey,
        content: input.content,
        contentType: input.contentType,
        updatedBy: ctx.user!.id
      });

      return { success: true, result };
    }),

  // Delete content (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar conteúdo",
        });
      }

      await deletePageContent(input.id.toString());
      return { success: true };
    }),

  // Get all page content (admin only)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem acessar todos os conteúdos",
      });
    }

    return await getAllPageContent();
  }),
});
