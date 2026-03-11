import { router, protectedProcedure, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../../_core/storage";
import crypto from "crypto";

export const uploadRouter = router({
  uploadImage: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        base64: z.string(),
        type: z.enum(["avatar", "course_cover", "article", "profile"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      try {
        const buffer = Buffer.from(input.base64, "base64");
        const filename = `${input.type}/${ctx.user.id}/${crypto.randomBytes(8).toString("hex")}_${input.filename}`;

        const { url } = await storagePut(filename, buffer, "image/jpeg");

        return { url, filename };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image",
        });
      }
    }),

  uploadCourseCover: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        base64: z.string(),
        courseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.base64, "base64");
        const filename = `courses/${input.courseId}/${crypto.randomBytes(8).toString("hex")}_${input.filename}`;

        const { url } = await storagePut(filename, buffer, "image/jpeg");

        return { url, filename };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload course cover",
        });
      }
    }),

  deleteImage: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Implement deletion logic based on your storage provider
      return { success: true };
    }),
});
