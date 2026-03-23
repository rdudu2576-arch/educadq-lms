import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
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
  getCourseBySlugOrId,
  getDb,
} from "../../infra/db.js";
import { lessonMaterials } from "../../infra/schema.pg.js";
import { inArray } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateCourseInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  courseHours: z.number().min(1, "Course must have at least 1 hour"),
  price: z.string(),
  minimumGrade: z.number().default(70),
  maxInstallments: z.number().default(1),
  professorId: z.number().min(1, "Professor ID is required"),
  lessons: z
    .array(
      z.object({
        title: z.string().min(1),
        type: z.enum(["video", "text", "live", "material"]),
        content: z.string().optional(),
        videoUrl: z.string().url().optional(),
        liveUrl: z.string().url().optional(),
        order: z.number().min(0),
      })
    )
    .optional(),
});

const UpdateCourseInput = z.object({
  courseId: z.number().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  courseHours: z.number().min(1).optional(),
  price: z.string().optional(),
  minimumGrade: z.number().optional(),
  maxInstallments: z.number().optional(),
});

const GetCoursesInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const GetCourseByIdInput = z.object({
  courseId: z.number().min(1),
});

const GetCourseBySlugInput = z.object({
  slug: z.string().min(1),
});

const GetCourseByProfessorInput = z.object({
  professorId: z.number().min(1),
});

const EnrollInput = z.object({
  courseId: z.number().min(1),
});

const GetEnrollmentsInput = z.object({
  courseId: z.number().min(1),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function canManageCourse(userRole: string | undefined, userId: number | undefined, professorId: number): boolean {
  return userRole === "admin" || userId === professorId;
}

async function buildCourseResponse(courseId: number) {
  const lessons = await getLessonsByCourse(courseId);
  const modules = await getModulesByCourse(courseId);
  return { lessons, modules, materials: [] };
}

// ============================================================================
// ROUTER
// ============================================================================

export const coursesRouter = router({
  getAll: publicProcedure
    .input(GetCoursesInput)
    .query(async ({ input }) => {
      return await getCourses(input.limit, input.offset);
    }),

  getFreeCourses: publicProcedure
    .input(GetCoursesInput)
    .query(async ({ input }) => {
      const allCourses = await getCourses();
      const freeCourses = allCourses.filter((course) => parseFloat(course.price.toString()) === 0);
      return freeCourses.slice(input.offset, input.offset + input.limit);
    }),

  getBySlug: publicProcedure
    .input(GetCourseBySlugInput)
    .query(async ({ input }) => {
      const course = await getCourseBySlugOrId(input.slug);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      const courseData = await buildCourseResponse(course.id);
      return { ...course, ...courseData };
    }),

  getById: publicProcedure
    .input(GetCourseByIdInput)
    .query(async ({ input }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }
      const courseData = await buildCourseResponse(input.courseId);
      return { ...course, ...courseData };
    }),

  getByProfessor: protectedProcedure
    .input(GetCourseByProfessorInput)
    .query(async ({ input, ctx }) => {
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, input.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own courses",
        });
      }
      return await getCoursesByProfessor(input.professorId);
    }),

  create: protectedProcedure
    .input(CreateCourseInput)
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

      const courseId = courseResult.id;

      const moduleResult = await createModule({
        courseId,
        title: "Main Module",
        description: "Default course module",
        order: 0,
      });

      if (moduleResult && input.lessons && input.lessons.length > 0) {
        const moduleId = moduleResult.id;
        for (const lesson of input.lessons) {
          await createLesson({
            moduleId,
            title: lesson.title,
            type: lesson.type as any,
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
    .input(UpdateCourseInput)
    .mutation(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this course",
        });
      }

      const { courseId, ...updateData } = input;
      return await updateCourse(courseId, updateData);
    }),

  enroll: protectedProcedure
    .input(EnrollInput)
    .mutation(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const existing = await getEnrollmentStatus(ctx.user!.id, input.courseId);
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already enrolled in this course",
        });
      }

      return await enrollStudent(ctx.user!.id, input.courseId);
    }),

  getStudentCourses: protectedProcedure.query(async ({ ctx }) => {
    return await getStudentEnrollments(ctx.user!.id);
  }),

  getEnrollments: protectedProcedure
    .input(GetEnrollmentsInput)
    .query(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view enrollments",
        });
      }

      return await getCourseEnrollments(input.courseId);
    }),

  list: publicProcedure
    .input(GetCoursesInput)
    .query(async ({ input }) => {
      return await getCourses(input.limit, input.offset);
    }),

  delete: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can delete courses",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Importar dinamicamente para evitar problemas de dependência circular
      const { courses } = await import("../../infra/schema.pg.js");
      const { eq } = await import("drizzle-orm");

      await db.delete(courses).where(eq(courses.id, input.courseId));
      return { success: true };
    }),

  getCourseMaterials: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const lessons = await getLessonsByCourse(input.courseId);
      const lessonIds = lessons.map(l => l.id);
      
      if (lessonIds.length === 0) return [];
      
      return await db
        .select()
        .from(lessonMaterials)
        .where(inArray(lessonMaterials.lessonId, lessonIds));
    }),
});
