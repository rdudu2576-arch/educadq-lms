import { publicProcedure, protectedProcedure, adminProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { assessments, questions, questionOptions, studentAnswers } from "../../infra/schema.js";
import { eq, and } from "drizzle-orm";
import { getDb } from "../../infra/db.js";

export const assessmentsRouter = router({
  // Get assessments for a course
  getCourseAssessments: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const result = await db
        .select()
        .from(assessments)
        .where(eq(assessments.courseId, input.courseId));
      return result;
    }),

  // Get assessment details with questions
  getAssessmentDetails: publicProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const assessment = await db
        .select()
        .from(assessments)
        .where(eq(assessments.id, input.assessmentId));

      if (!assessment.length) return null;

      const qs = await db
        .select()
        .from(questions)
        .where(eq(questions.assessmentId, input.assessmentId));

      const questionsWithOptions = await Promise.all(
        qs.map(async (q) => {
          const opts = await db
            .select()
            .from(questionOptions)
            .where(eq(questionOptions.questionId, q.id));
          return { ...q, options: opts };
        })
      );

      return { ...assessment[0], questions: questionsWithOptions };
    }),

  // Create assessment (admin/professor only)
  createAssessment: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        lessonId: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["quiz", "assignment", "exam"]),
        passingScore: z.number().default(70),
        maxAttempts: z.number().default(3),
        timeLimit: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db.insert(assessments).values({
        courseId: input.courseId,
        lessonId: input.lessonId || null,
        title: input.title,
        description: input.description || null,
        type: input.type as any,
        passingScore: input.passingScore,
        maxAttempts: input.maxAttempts,
        timeLimit: input.timeLimit || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return result;
    }),

  // Add question to assessment
  addQuestion: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number(),
        title: z.string(),
        type: z.enum(["multiple_choice", "true_false", "short_answer"]),
        order: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db.insert(questions).values({
        assessmentId: input.assessmentId,
        title: input.title,
        type: input.type as any,
        order: input.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return result;
    }),

  // Add options to question (for multiple choice)
  addQuestionOption: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
        text: z.string(),
        isCorrect: z.boolean(),
        order: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin" && ctx.user?.role !== "professor") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const result = await db.insert(questionOptions).values({
        questionId: input.questionId,
        text: input.text,
        isCorrect: input.isCorrect,
        order: input.order,
        createdAt: new Date(),
      });

      return result;
    }),

  // Submit assessment answers
  submitAssessment: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number(),
        answers: z.array(
          z.object({
            questionId: z.number(),
            selectedOptionId: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error("Unauthorized");

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Save answers
      for (const answer of input.answers) {
        await db.insert(studentAnswers).values({
          studentId: ctx.user.id,
          assessmentId: input.assessmentId,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          createdAt: new Date(),
        });
      }

      // Calculate score
      let correctCount = 0;
      for (const answer of input.answers) {
        const option = await db
          .select()
          .from(questionOptions)
          .where(eq(questionOptions.id, answer.selectedOptionId));

        if (option.length && option[0].isCorrect) {
          correctCount++;
        }
      }

      const totalQuestions = input.answers.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      return { score, passed: score >= 70 };
    }),
});
