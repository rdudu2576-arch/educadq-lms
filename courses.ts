import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createCourse,
  getCourses,
  getCourseById,
  getCoursesByProfessor,
  updateCourse,
  getLessonsByCourse,
  getCourseEnrollments,
  getStudentEnrollments,
  enrollStudent,
  getEnrollmentStatus,
  createModule,
  createLesson,
  getModulesByCourse,
  getCourseBySlug,
  getCourseBySlugOrId,
} from "../db";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const coursesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await getCourses(input.limit, input.offset);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const course = await getCourseBySlugOrId(input.slug);
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Curso não encontrado" });
      }
      const lessons = await getLessonsByCourse(course.id);
      const courseModules = await getModulesByCourse(course.id);
      return { ...course, lessons, modules: courseModules };
    }),

  getById: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Curso não encontrado",
        });
      }
      const lessons = await getLessonsByCourse(input.courseId);
      const courseModules = await getModulesByCourse(input.courseId);
      return { ...course, lessons, modules: courseModules };
    }),

  getByProfessor: protectedProcedure
    .input(z.object({ professorId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.id !== input.professorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own courses",
        });
      }
      return await getCoursesByProfessor(input.professorId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        coverUrl: z.string().optional(),
        trailerUrl: z.string().optional(),
        courseHours: z.number().min(1),
        price: z.string(),
        minimumGrade: z.number().default(70),
        maxInstallments: z.number().default(1),
        professorId: z.number(),
        lessons: z
          .array(
            z.object({
              title: z.string().min(1),
              type: z.enum(["video", "text", "live", "material"]),
              content: z.string().optional(),
              videoUrl: z.string().optional(),
              liveUrl: z.string().optional(),
              order: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins and professors can create courses",
        });
      }

      if (ctx.user?.role === "professor" && ctx.user?.id !== input.professorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Professors can only create courses for themselves",
        });
      }

      // Create the course
      const courseResult = await createCourse({
        title: input.title,
        description: input.description,
        coverUrl: input.coverUrl,
        trailerUrl: input.trailerUrl,
        courseHours: input.courseHours,
        price: input.price,
        minimumGrade: input.minimumGrade,
        maxInstallments: input.maxInstallments,
        professorId: input.professorId,
      });

      if (!courseResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create course",
        });
      }

      // Get the inserted course ID
      const courseId = (courseResult as any)[0]?.insertId;
      if (!courseId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get course ID",
        });
      }

      // Create a default module for the course
      const moduleResult = await createModule({
        courseId,
        title: "Módulo Principal",
        description: "Módulo padrão do curso",
        order: 0,
      });

      const moduleId = (moduleResult as any)?.[0]?.insertId;

      // Create lessons if provided
      if (input.lessons && input.lessons.length > 0 && moduleId) {
        for (const lesson of input.lessons) {
          await createLesson({
            moduleId,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            liveUrl: lesson.liveUrl,
            order: lesson.order,
          });
        }
      }

      return { courseId };
    }),

  update: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        coverUrl: z.string().optional(),
        trailerUrl: z.string().optional(),
        courseHours: z.number().optional(),
        price: z.string().optional(),
        minimumGrade: z.number().optional(),
        maxInstallments: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (ctx.user?.role !== "admin" && ctx.user?.id !== course.professorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this course",
        });
      }

      const { courseId, ...updateData } = input;
      return await updateCourse(courseId, updateData);
    }),

  enroll: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to enroll",
        });
      }

      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const existing = await getEnrollmentStatus(ctx.user.id, input.courseId);
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already enrolled in this course",
        });
      }

      return await enrollStudent(ctx.user.id, input.courseId);
    }),

  getStudentCourses: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }
    return await getStudentEnrollments(ctx.user.id);
  }),

  getEnrollments: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (ctx.user?.role !== "admin" && ctx.user?.id !== course.professorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view enrollments",
        });
      }

      return await getCourseEnrollments(input.courseId);
    }),
});
