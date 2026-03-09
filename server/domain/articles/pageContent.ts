import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import {
  getPageContent,
  getPageContentByKey,
  updatePageContent,
  deletePageContent,
  getAllPageContent,
} from "../../infra/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const pageContentRouter = router({
  // Get all content for a specific page (public)
  getByPage: publicProcedure
    .input(z.object({ pageKey: z.string() }))
    .query(async ({ input }: any) => {
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
    .query(async ({ input }: any) => {
      const content = await getPageContentByKey(
        input.pageKey,
        input.sectionKey,
        input.contentKey
      );
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
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem editar conteúdo",
        });
      }

      const id = await updatePageContent(
        input.pageKey,
        input.sectionKey,
        input.contentKey,
        input.content,
        input.contentType,
        ctx.user.id
      );

      return { id, success: true };
    }),

  // Delete content (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar conteúdo",
        });
      }

      const success = await deletePageContent(input.id);
      return { success };
    }),

  // Get all page content (admin only)
  getAll: protectedProcedure.query(async ({ ctx }: any) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem acessar todos os conteúdos",
      });
    }

    return await getAllPageContent();
  }),
});
