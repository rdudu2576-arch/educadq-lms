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
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await updatePayment(input.paymentId, { status: "paid", paidAt: new Date() });
      return { success: true };
    }),

  getStudentPayments: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await getPaymentsByStudent(ctx.user.id);
  }),

  getAllPayments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return await getAllPayments();
  }),

  getOverdue: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return await getOverduePayments();
  }),

  getByCourse: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return await getPaymentsByCourse(input.courseId);
    }),
});