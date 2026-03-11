import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import * as db from "../../infra/db.js";

export const articlesRouter = router({
  list: publicProcedure.query(async () => {
    return db.getArticles();
  }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
    }
    return db.getAllArticles();
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const article = await db.getArticleBySlug(input.slug);
      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artigo não encontrado" });
      }
      return article;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
      }
      const article = await db.getArticleById(input.id);
      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artigo não encontrado" });
      }
      return article;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      cover: z.string().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
      }
      const id = await db.createArticle({
        ...input,
        author: ctx.user!.name || "Admin",
        authorId: ctx.user!.id,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      cover: z.string().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
      }
      const { id, ...data } = input;
      await db.updateArticle(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
      }
      await db.deleteArticle(input.id);
      return { success: true };
    }),
});
