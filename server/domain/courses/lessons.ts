import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc";
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
} from "../../infra/db";
import { z } from "zod";
import { logInfo, logError, logSecurity } from "../../utils/logger";
import { TRPCError } from "@trpc/server";

export const lessonsRouter = router({
  // ===== MODULES =====
  getModulesByCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }: any) => {
      return await getModulesByCourse(input.courseId);
    }),

  createModule: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      order: z.coerce.number().min(0).optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const course = await getCourseById(input.courseId);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });
      if (ctx.user?.role !== "admin" && ctx.user?.id !== course.professorId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      return await createModule(input);
    }),

  updateModule: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const mod = await getModuleById(input.moduleId);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Modulo nao encontrado" });
      const course = await getCourseById(mod.courseId);
      if (ctx.user?.role !== "admin" && ctx.user?.id !== course?.professorId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      const { moduleId, ...data } = input;
      return await updateModule(moduleId, data);
    }),

  deleteModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      const mod = await getModuleById(input.moduleId);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Modulo nao encontrado" });
      const course = await getCourseById(mod.courseId);
      if (ctx.user?.role !== "admin" && ctx.user?.id !== course?.professorId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      return await deleteModule(input.moduleId);
    }),

  // ===== LESSONS =====
  getByCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }: any) => {
      return await getLessonsByCourse(input.courseId);
    }),

  getByModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }: any) => {
      return await getLessonsByModule(input.moduleId);
    }),

  getById: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }: any) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });
      const materials = await getMaterialsByLesson(input.lessonId);
      return { ...lesson, materials };
    }),

  create: protectedProcedure
    .input(z.object({
      moduleId: z.coerce.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["video", "text", "live", "material"]),
      content: z.string().optional(),
      videoUrl: z.string().optional(),
      liveUrl: z.string().optional(),
      order: z.coerce.number().min(0).optional(),
      durationMinutes: z.coerce.number().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      console.log("[LESSON CREATE] Mutation called");
      console.log("[LESSON CREATE] Input:", input);
      console.log("[LESSON CREATE] User:", ctx.session?.user || ctx.user);
      
      const user = ctx.session?.user || ctx.user;
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Nao autenticado" });
      
      const mod = await getModuleById(input.moduleId);
      console.log("[LESSON CREATE] Module found:", mod);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Modulo nao encontrado" });
      
      const course = await getCourseById(mod.courseId);
      console.log("[LESSON CREATE] Course found:", course);
      
      if (user.role !== "admin" && user.id !== course?.professorId) {
        console.log("[LESSON CREATE] Permission denied");
        await logSecurity("lesson.create", "Tentativa de criar aula sem permissao", { courseId: mod.courseId }, user.id);
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      
      console.log("[LESSON CREATE] Creating lesson with input:", input);
      const result = await createLesson(input);
      console.log("[LESSON CREATE] Lesson created:", result);
      
      await logInfo("lesson.create", `Aula criada: ${input.title}`, { courseId: mod.courseId, moduleId: input.moduleId }, user.id);
      
      return result;
    }),

  update: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(["video", "text", "live", "material"]).optional(),
      content: z.string().optional(),
      videoUrl: z.string().optional(),
      liveUrl: z.string().optional(),
      order: z.number().optional(),
      durationMinutes: z.coerce.number().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });
      const mod = await getModuleById(lesson.moduleId);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Modulo nao encontrado" });
      const course = await getCourseById(mod.courseId);
      if (ctx.user?.role !== "admin" && ctx.user?.id !== course?.professorId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      const { lessonId, ...data } = input;
      return await updateLesson(lessonId, data);
    }),

  delete: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });
      return await deleteLesson(input.lessonId);
    }),

  // ===== MATERIALS =====
  addMaterial: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      title: z.string().min(1),
      type: z.enum(["pdf", "document", "spreadsheet", "video", "link"]).default("link"),
      url: z.string().url(),
      fileSize: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });
      return await createLessonMaterial(input);
    }),

  removeMaterial: protectedProcedure
    .input(z.object({ materialId: z.number() }))
    .mutation(async ({ input }: any) => {
      return await deleteLessonMaterial(input.materialId);
    }),

  getMaterials: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }: any) => {
      return await getMaterialsByLesson(input.lessonId);
    }),
});
