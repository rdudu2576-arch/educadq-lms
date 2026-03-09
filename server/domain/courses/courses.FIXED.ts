import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
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
} from "../../infra/db";
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

/**
 * Check if user has permission to manage a course
 */
function canManageCourse(userRole: string | undefined, userId: number | undefined, professorId: number): boolean {
  return userRole === "admin" || userId === professorId;
}

/**
 * Build course response with lessons and modules
 */
async function buildCourseResponse(courseId: number) {
  const lessons = await getLessonsByCourse(courseId);
  const modules = await getModulesByCourse(courseId);
  return { lessons, modules };
}

// ============================================================================
// ROUTER
// ============================================================================

export const coursesRouter = router({
  /**
   * Get all courses with pagination
   * Public endpoint - anyone can view courses
   */
  getAll: publicProcedure
    .input(GetCoursesInput)
    .query(async ({ input }) => {
      return await getCourses(input.limit, input.offset);
    }),

  /**
   * Get free courses (price = 0)
   * Public endpoint
   */
  getFreeCourses: publicProcedure
    .input(GetCoursesInput)
    .query(async ({ input }) => {
      const courses = await getCourses();
      const freeCourses = courses.filter((course) => course.price === 0);
      return freeCourses.slice(input.offset, input.offset + input.limit);
    }),

  /**
   * Get course by slug or ID
   * Public endpoint
   */
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

  /**
   * Get course by ID with lessons and modules
   * Public endpoint
   */
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

  /**
   * Get courses by professor
   * Protected - only admin or the professor can view
   */
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

  /**
   * Create a new course
   * Protected - only admin and professor can create
   */
  create: protectedProcedure
    .input(CreateCourseInput)
    .mutation(async ({ input, ctx }) => {
      // Validate user role
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins and professors can create courses",
        });
      }

      // Professors can only create courses for themselves
      if (ctx.user.role === "professor" && ctx.user.id !== input.professorId) {
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

      // Extract course ID from result
      const courseId = (courseResult as any)[0]?.insertId;
      if (!courseId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve course ID",
        });
      }

      // Create default module
      const moduleResult = await createModule({
        courseId,
        title: "Main Module",
        description: "Default course module",
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

  /**
   * Update course
   * Protected - only admin or course professor can update
   */
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

      // Check permissions
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this course",
        });
      }

      const { courseId, ...updateData } = input;
      return await updateCourse(courseId, updateData);
    }),

  /**
   * Enroll student in course
   * Protected - authenticated users can enroll
   */
  enroll: protectedProcedure
    .input(EnrollInput)
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

  /**
   * Get courses enrolled by current student
   * Protected - authenticated users can view their enrollments
   */
  getStudentCourses: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }
    return await getStudentEnrollments(ctx.user.id);
  }),

  /**
   * Get course enrollments
   * Protected - only admin or course professor can view
   */
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

      // Check permissions
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view enrollments",
        });
      }

      return await getCourseEnrollments(input.courseId);
    }),

  /**
   * Alias for getAll - for compatibility
   */
  list: publicProcedure
    .input(GetCoursesInput)
    .query(async ({ input }) => {
      return await getCourses(input.limit, input.offset);
    }),
});
