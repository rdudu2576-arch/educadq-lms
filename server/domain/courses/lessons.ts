import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc.js";
import {
  createLesson,
  getLessonsByCourse,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
  getCourseById,
  getModuleById,
  createLessonMaterial,
  getMaterialsByLesson,
  deleteLessonMaterial,
  createModule,
  getModulesByCourse,
  updateModule,
  deleteModule,
} from "../../infra/db.js";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ModuleInput = z.object({
  courseId: z.number().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  order: z.coerce.number().min(0).default(0),
});

const UpdateModuleInput = z.object({
  moduleId: z.number().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().min(0).optional(),
});

const DeleteModuleInput = z.object({
  moduleId: z.number().min(1),
});

const GetModulesByCourseInput = z.object({
  courseId: z.number().min(1),
});

const LessonInput = z.object({
  moduleId: z.coerce.number().min(1),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["video", "text", "live", "material"]),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  order: z.coerce.number().min(0).default(0),
  durationMinutes: z.coerce.number().min(0).optional(),
});

const UpdateLessonInput = z.object({
  lessonId: z.number().min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["video", "text", "live", "material"]).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  order: z.number().min(0).optional(),
  durationMinutes: z.coerce.number().min(0).optional(),
});

const DeleteLessonInput = z.object({
  lessonId: z.number().min(1),
});

const GetLessonByIdInput = z.number();

const GetLessonsByModuleInput = z.object({
  moduleId: z.number().min(1),
});

const GetLessonsByCoursInput = z.object({
  courseId: z.number().min(1),
});

const MaterialInput = z.object({
  lessonId: z.number().min(1),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["pdf", "document", "spreadsheet", "video", "link"]).default("link"),
  url: z.string().url("Invalid URL"),
  fileSize: z.number().min(0).optional(),
});

const DeleteMaterialInput = z.object({
  materialId: z.number().min(1),
});

const GetMaterialsInput = z.object({
  lessonId: z.number().min(1),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function canManageCourse(userRole: string | undefined, userId: number | undefined, professorId: number | undefined): boolean {
  if (!userRole || !userId) return false;
  return userRole === "admin" || userId === professorId;
}

async function buildLessonResponse(lessonId: number) {
  const materials = await getMaterialsByLesson(lessonId);
  return { materials };
}

// ============================================================================
// ROUTER
// ============================================================================

export const lessonsRouter = router({
  getModulesByCourse: protectedProcedure
    .input(GetModulesByCourseInput)
    .query(async ({ input }) => {
      return await getModulesByCourse(input.courseId);
    }),

  createModule: protectedProcedure
    .input(ModuleInput)
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
          message: "You don't have permission to create modules in this course",
        });
      }

      return await createModule({
        courseId: input.courseId,
        title: input.title,
        description: input.description,
        order: input.order,
      });
    }),

  updateModule: protectedProcedure
    .input(UpdateModuleInput)
    .mutation(async ({ input, ctx }) => {
      const module = await getModuleById(input.moduleId);
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      const course = await getCourseById(module.courseId);
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course?.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this module",
        });
      }

      const { moduleId, ...data } = input;
      return await updateModule(moduleId, data);
    }),

  deleteModule: protectedProcedure
    .input(DeleteModuleInput)
    .mutation(async ({ input, ctx }) => {
      const module = await getModuleById(input.moduleId);
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      const course = await getCourseById(module.courseId);
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course?.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this module",
        });
      }

      return await deleteModule(input.moduleId);
    }),

  getByCourse: protectedProcedure
    .input(GetLessonsByCoursInput)
    .query(async ({ input }) => {
      return await getLessonsByCourse(input.courseId);
    }),

  getByModule: protectedProcedure
    .input(GetLessonsByModuleInput)
    .query(async ({ input }) => {
      return await getLessonsByModule(input.moduleId);
    }),

  getById: protectedProcedure
    .input(GetLessonByIdInput)
    .query(async ({ input }) => {
      const lesson = await getLessonById(input);
      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }
      const lessonData = await buildLessonResponse(input);
      return { ...lesson, ...lessonData };
    }),

  create: protectedProcedure
    .input(LessonInput)
    .mutation(async ({ input, ctx }) => {
      const module = await getModuleById(input.moduleId);
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      const course = await getCourseById(module.courseId);
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course?.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create lessons in this course",
        });
      }

      return await createLesson({
        moduleId: input.moduleId,
        title: input.title,
        description: input.description,
        type: input.type as any,
        content: input.content,
        videoUrl: input.videoUrl,
        liveUrl: input.liveUrl,
        order: input.order,
        durationMinutes: input.durationMinutes,
      });
    }),

  update: protectedProcedure
    .input(UpdateLessonInput)
    .mutation(async ({ input, ctx }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      const module = await getModuleById(lesson.moduleId);
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      const course = await getCourseById(module.courseId);
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course?.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this lesson",
        });
      }

      const { lessonId, ...data } = input;
      return await updateLesson(lessonId, {
        ...data,
        type: data.type as any,
      });
    }),

  delete: protectedProcedure
    .input(DeleteLessonInput)
    .mutation(async ({ input, ctx }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      const module = await getModuleById(lesson.moduleId);
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      const course = await getCourseById(module.courseId);
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course?.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this lesson",
        });
      }

      return await deleteLesson(input.lessonId);
    }),

  addMaterial: protectedProcedure
    .input(MaterialInput)
    .mutation(async ({ input, ctx }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      const module = await getModuleById(lesson.moduleId);
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      const course = await getCourseById(module.courseId);
      if (!canManageCourse(ctx.user?.role, ctx.user?.id, course?.professorId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add materials to this lesson",
        });
      }

      return await createLessonMaterial({
        ...input,
        type: input.type as any,
      });
    }),

  removeMaterial: protectedProcedure
    .input(DeleteMaterialInput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      return await deleteLessonMaterial(input.materialId);
    }),

  getMaterials: protectedProcedure
    .input(GetMaterialsInput)
    .query(async ({ input }) => {
      return await getMaterialsByLesson(input.lessonId);
    }),
});
