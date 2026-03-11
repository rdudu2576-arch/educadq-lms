import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc.js";
import { assessments, questions, questionOptions, studentAnswers, assessmentResults, courses } from "../../infra/schema.pg.js";
import { getDb } from "../../infra/db.js";
import { eq, and } from "drizzle-orm";
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
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const courseResult = await db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1);
      const course = courseResult[0];
      
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });
      if (ctx.user?.role !== "admin" && ctx.user?.id !== course.professorId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
      }

      const result = await db.insert(assessments).values({
        courseId: input.courseId,
        lessonId: input.lessonId,
        title: input.title,
        description: input.description,
        type: input.type as any,
        passingScore: input.passingScore,
        maxAttempts: input.maxAttempts,
        timeLimit: input.timeLimit,
      } as any).returning();

      return result[0];
    }),

  getByCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(assessments).where(eq(assessments.courseId, input.courseId));
    }),

  getById: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const assessmentResult = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
      const assessment = assessmentResult[0];
      
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
      
      const questionsList = await db.select().from(questions).where(eq(questions.assessmentId, input.assessmentId));
      
      const questionsWithOptions = await Promise.all(
        questionsList.map(async (q) => {
          const options = await db.select().from(questionOptions).where(eq(questionOptions.questionId, q.id));
          return { ...q, options };
        })
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
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const assessmentResult = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
      const assessment = assessmentResult[0];
      
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
      
      if (assessment.courseId) {
        const courseResult = await db.select().from(courses).where(eq(courses.id, assessment.courseId)).limit(1);
        const course = courseResult[0];
        if (ctx.user?.role !== "admin" && ctx.user?.id !== course?.professorId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
        }
      }

      const result = await db.insert(questions).values({
        assessmentId: input.assessmentId,
        title: input.title,
        type: input.type as any,
        order: input.order,
      } as any).returning();

      return result[0];
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
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

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
        input.options.map((opt: any) => 
          db.insert(questionOptions).values({
            questionId: input.questionId,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order,
          } as any).returning()
        )
      );
    }),

  submit: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      answers: z.array(z.object({
        questionId: z.number(),
        selectedOptionId: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const studentId = ctx.user!.id;
      const assessmentResult = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
      const assessment = assessmentResult[0];
      
      if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });

      const questionsList = await db.select().from(questions).where(eq(questions.assessmentId, input.assessmentId));
      
      let correctCount = 0;
      for (const answer of input.answers) {
        const question = questionsList.find(q => q.id === answer.questionId);
        if (!question) continue;
        
        const options = await db.select().from(questionOptions).where(eq(questionOptions.questionId, question.id));
        const correctOption = options.find((o: any) => o.isCorrect);
        const isCorrect = correctOption?.id === answer.selectedOptionId;
        
        if (isCorrect) correctCount++;

        await db.insert(studentAnswers).values({
          studentId,
          assessmentId: input.assessmentId,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: isCorrect,
        } as any);
      }

      const total = questionsList.length;
      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passingScore = assessment.passingScore || 70;
      const passed = percentage >= passingScore;

      await db.insert(assessmentResults).values({
        studentId,
        assessmentId: input.assessmentId,
        score: percentage.toString(),
        passed,
        attemptNumber: 1,
      } as any);

      return {
        correct: correctCount,
        total,
        percentage,
        passed,
        passingScore,
      };
    }),
});
