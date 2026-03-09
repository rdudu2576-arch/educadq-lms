import { router, protectedProcedure, adminProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";

export const courseUpdateRouter = router({
  update: adminProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        coverUrl: z.string().optional(),
        trailerUrl: z.string().optional(),
        courseHours: z.number().optional(),
        price: z.string().optional(),
        minimumGrade: z.number().optional(),
        maxInstallments: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const course = await db.updateCourse(input.courseId, {
        title: input.title,
        description: input.description,
        coverUrl: input.coverUrl,
        trailerUrl: input.trailerUrl,
        courseHours: input.courseHours,
        price: input.price,
        minimumGrade: input.minimumGrade,
        maxInstallments: input.maxInstallments,
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  delete: adminProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCourse(input.courseId);
      return { success: true };
    }),
});
