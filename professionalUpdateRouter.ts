import { router, protectedProcedure, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";

export const professionalUpdateRouter = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().optional(),
        specialization: z.string().optional(),
        avatar: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const professional = await db.updateProfessional(ctx.user.userId, {
        bio: input.bio,
        specialization: input.specialization,
        avatar: input.avatar,
        phone: input.phone,
        website: input.website,
      });

      if (!professional) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Professional profile not found",
        });
      }

      return professional;
    }),

  updateByAdmin: adminProcedure
    .input(
      z.object({
        professionalId: z.number(),
        bio: z.string().optional(),
        specialization: z.string().optional(),
        avatar: z.string().optional(),
        ranking: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const professional = await db.updateProfessional(input.professionalId, {
        bio: input.bio,
        specialization: input.specialization,
        avatar: input.avatar,
        ranking: input.ranking,
      });

      if (!professional) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Professional not found",
        });
      }

      return professional;
    }),
});
