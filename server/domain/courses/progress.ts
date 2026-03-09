import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc";
import {
  recordLessonProgress,
  getStudentLessonProgress,
  calculateCourseProgress,
  getEnrollmentStatus,
  getLessonById,
  getCourseById,
  getModuleById,
  getStudentAssessmentScore,
  getAssessmentById,
  recordStudentAnswer,
  getOptionsByQuestion,
  createCertificate,
  getCertificateByCourse,
} from "../../infra/db";
import { z } from "zod";

// Generate unique certificate number
function generateCertificateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EDQ-${year}-${random}`;
}

// Check if student completed 100% and auto-generate certificate
async function checkAndIssueCertificate(studentId: number, courseId: number) {
  const progress = await calculateCourseProgress(studentId, courseId);
  if (progress >= 100) {
    // Check if certificate already exists
    const existing = await getCertificateByCourse(studentId, courseId);
    if (!existing) {
      await createCertificate({
        studentId,
        courseId,
        certificateNumber: generateCertificateNumber(),
      });
      return true;
    }
  }
  return false;
}

export const progressRouter = router({
  recordCompletion: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const lesson = await getLessonById(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });

      // Get courseId via module
      const mod = await getModuleById(lesson.moduleId);
      if (!mod) throw new TRPCError({ code: "NOT_FOUND", message: "Modulo nao encontrado" });

      const enrollment = await getEnrollmentStatus(ctx.user.id, mod.courseId);
      if (!enrollment) throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });

      await recordLessonProgress(ctx.user.id, input.lessonId);

      // Auto-check certificate after completing a lesson
      const certificateIssued = await checkAndIssueCertificate(ctx.user.id, mod.courseId);

      return { success: true, certificateIssued };
    }),

  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const enrollment = await getEnrollmentStatus(ctx.user.id, input.courseId);
      if (!enrollment) throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });

      const progress = await getStudentLessonProgress(ctx.user.id, input.courseId);
      const percentage = await calculateCourseProgress(ctx.user.id, input.courseId);

      return { progress, percentage };
    }),

  getCourseProgressReport: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      const course = await getCourseById(input.courseId);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });

      if (ctx.user?.role !== "admin" && ctx.user?.id !== course.professorId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return { courseId: input.courseId };
    }),

  submitAnswer: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      questionId: z.number(),
      alternativeId: z.number(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });

      const courseId = assessment.courseId;
      if (courseId) {
        const enrollment = await getEnrollmentStatus(ctx.user.id, courseId);
        if (!enrollment) throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });
      }

      const options = await getOptionsByQuestion(input.questionId);
      const selected = options.find((a) => a.id === input.alternativeId);
      if (!selected) throw new TRPCError({ code: "NOT_FOUND", message: "Alternativa nao encontrada" });

      await recordStudentAnswer({
        studentId: ctx.user.id,
        assessmentId: input.assessmentId,
        questionId: input.questionId,
        selectedOptionId: input.alternativeId,
        isCorrect: selected.isCorrect,
      });

      return { isCorrect: selected.isCorrect };
    }),

  getAssessmentScore: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });

      const courseId = assessment.courseId;
      if (courseId) {
        const enrollment = await getEnrollmentStatus(ctx.user.id, courseId);
        if (!enrollment) throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });
      }

      return await getStudentAssessmentScore(ctx.user.id, input.assessmentId);
    }),

  getCompletedCourses: protectedProcedure.query(async ({ ctx }: any) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return [];
  }),

  getProgressSummary: protectedProcedure.query(async ({ ctx }: any) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return {
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      averageProgress: 0,
      completionRate: 0,
    };
  }),
});
