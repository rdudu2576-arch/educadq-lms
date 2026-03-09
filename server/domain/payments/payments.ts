import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc.js";
import {
  createPayment,
  getPaymentsByStudent,
  getPaymentsByCourse,
  getAllPayments,
  updatePayment,
  getOverduePayments,
  getCourseById,
  enrollStudent,
} from "../../infra/db.js";
import { z } from "zod";

export const paymentsRouter = router({
  create: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      amount: z.string(),
      installments: z.number().min(1).default(1),
      pixKey: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const course = await getCourseById(input.courseId);
      if (!course) throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });

      if (input.installments > course.maxInstallments) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Maximo de ${course.maxInstallments} parcelas` });
      }

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);

      return await createPayment({
        studentId: ctx.user.id,
        courseId: input.courseId,
        amount: input.amount,
        installments: input.installments,
        pixKey: input.pixKey || "41988913431",
        dueDate,
      });
    }),

  // Admin: register payment manually
  adminCreate: protectedProcedure
    .input(z.object({
      studentId: z.number(),
      courseId: z.number(),
      amount: z.string(),
      installments: z.number().min(1).default(1),
      pixKey: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });

      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);

      return await createPayment({
        studentId: input.studentId,
        courseId: input.courseId,
        amount: input.amount,
        installments: input.installments,
        pixKey: input.pixKey || "41988913431",
        dueDate,
      });
    }),

  // Mark payment as paid
  markPaid: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updatePayment(input.paymentId, { status: "paid", paidAt: new Date() });
      return { success: true };
    }),

  getStudentPayments: protectedProcedure.query(async ({ ctx }: any) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await getPaymentsByStudent(ctx.user.id);
  }),

  getAllPayments: protectedProcedure.query(async ({ ctx }: any) => {
    if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return await getAllPayments();
  }),

  getOverdue: protectedProcedure.query(async ({ ctx }: any) => {
    if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return await getOverduePayments();
  }),

  getByCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await getPaymentsByCourse(input.courseId);
    }),
});
