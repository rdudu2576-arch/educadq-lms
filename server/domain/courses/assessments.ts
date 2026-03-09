import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc.js";
import {
  createAssessment,
  getAssessmentsByCourse,
  getAssessmentById,
  createQuestion,
  getQuestionsByAssessment,
  createQuestionOption,
  getOptionsByQuestion,
  getCourseById,
  recordStudentAnswer,
  createAssessmentResult,
} from "../../infra/db.js";
import { z } from "zod";

export const assessmentsRouter = router({
  create: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      lessonId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["quiz", "assignment", "exam"]).default("exam"),
      passingScore: z.number().optional(),
      maxAttempts: z.number().optional(),
      timeLimit: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const course = await getCourseById(input.courseId);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });
      if (ctx.user?.role !== "admin" && ctx.user?.id !== course.professorId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      return await createAssessment(input);
    }),

  getByCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }: any) => {
      return await getAssessmentsByCourse(input.courseId);
    }),

  getById: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: any) => {
      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
      const questions = await getQuestionsByAssessment(input.assessmentId);
      const questionsWithOptions = await Promise.all(
        questions.map(async (q) => ({
          ...q,
          options: await getOptionsByQuestion(q.id),
        }))
      );
      return { ...assessment, questions: questionsWithOptions };
    }),

  createQuestion: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      title: z.string().min(1),
      type: z.enum(["multiple_choice", "true_false", "short_answer"]).default("multiple_choice"),
      order: z.number().min(1),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
      if (assessment.courseId) {
        const course = await getCourseById(assessment.courseId);
        if (ctx.user?.role !== "admin" && ctx.user?.id !== course?.professorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
        }
      }
      return await createQuestion(input);
    }),

  createQuestionOptions: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      options: z.array(z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }
      if (input.options.length !== 5) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Deve ter exatamente 5 alternativas" });
      }
      const correctCount = input.options.filter((a: any) => a.isCorrect).length;
      if (correctCount !== 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Deve ter exatamente 1 alternativa correta" });
      }
      return await Promise.all(
        input.options.map((opt: any) => createQuestionOption({
          questionId: input.questionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        }))
      );
    }),

  getQuestions: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: any) => {
      const questions = await getQuestionsByAssessment(input.assessmentId);
      const withOptions = await Promise.all(
        questions.map(async (q) => ({
          ...q,
          options: await getOptionsByQuestion(q.id),
        }))
      );
      return withOptions;
    }),

  // Submit assessment answers and calculate score
  submit: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      answers: z.array(z.object({
        questionId: z.number(),
        selectedOptionId: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const studentId = ctx.user!.id;
      const assessment = await getAssessmentById(input.assessmentId);
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });

      // Get all questions with options to check correct answers
      const questions = await getQuestionsByAssessment(input.assessmentId);
      const questionsWithOptions = await Promise.all(
        questions.map(async (q) => ({
          ...q,
          options: await getOptionsByQuestion(q.id),
        }))
      );

      // Save each answer and check correctness
      let correctCount = 0;
      for (const answer of input.answers) {
        const question = questionsWithOptions.find(q => q.id === answer.questionId);
        if (!question) continue;
        const correctOption = question.options.find((o: any) => o.isCorrect);
        const isCorrect = correctOption?.id === answer.selectedOptionId;
        if (isCorrect) correctCount++;

        await recordStudentAnswer({
          studentId,
          assessmentId: input.assessmentId,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: isCorrect,
        });
      }

      const total = questions.length;
      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passingScore = assessment.passingScore || 70;
      const passed = percentage >= passingScore;

      // Save assessment result
      await createAssessmentResult({
        studentId,
        assessmentId: input.assessmentId,
        score: percentage.toString(),
        passed,
        attemptNumber: 1,
      });

      return {
        correct: correctCount,
        total,
        percentage,
        passed,
        passingScore,
      };
    }),
});
