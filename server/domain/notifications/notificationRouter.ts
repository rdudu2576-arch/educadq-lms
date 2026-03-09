import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import {
  sendWelcomeEmail,
  sendEnrollmentConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOverduePaymentEmail,
  sendCourseCompletionEmail,
  sendNewLessonEmail,
  sendPasswordResetEmail,
  sendAdminNewSaleEmail,
} from "../../services/emailNotifications";

export const notificationRouter = router({
  /**
   * Enviar email de boas-vindas
   */
  sendWelcome: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendWelcomeEmail(input.email, input.name);
      return { success };
    }),

  /**
   * Enviar confirmação de matrícula
   */
  sendEnrollmentConfirmation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        studentName: z.string(),
        courseName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendEnrollmentConfirmationEmail(
        input.email,
        input.studentName,
        input.courseName
      );
      return { success };
    }),

  /**
   * Enviar confirmação de pagamento
   */
  sendPaymentConfirmation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        studentName: z.string(),
        amount: z.number(),
        courseName: z.string(),
        transactionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendPaymentConfirmationEmail(
        input.email,
        input.studentName,
        input.amount,
        input.courseName,
        input.transactionId
      );
      return { success };
    }),

  /**
   * Enviar aviso de pagamento vencido
   */
  sendOverduePaymentWarning: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        studentName: z.string(),
        amount: z.number(),
        dueDate: z.date(),
        pixKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendOverduePaymentEmail(
        input.email,
        input.studentName,
        input.amount,
        input.dueDate,
        input.pixKey
      );
      return { success };
    }),

  /**
   * Enviar email de conclusão de curso
   */
  sendCourseCompletion: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        studentName: z.string(),
        courseName: z.string(),
        certificateUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendCourseCompletionEmail(
        input.email,
        input.studentName,
        input.courseName,
        input.certificateUrl
      );
      return { success };
    }),

  /**
   * Enviar notificação de nova aula
   */
  sendNewLesson: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        studentName: z.string(),
        courseName: z.string(),
        lessonTitle: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendNewLessonEmail(
        input.email,
        input.studentName,
        input.courseName,
        input.lessonTitle
      );
      return { success };
    }),

  /**
   * Enviar link de recuperação de senha
   */
  sendPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        resetLink: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendPasswordResetEmail(input.email, input.resetLink);
      return { success };
    }),

  /**
   * Notificar admin sobre nova venda
   */
  notifyAdminNewSale: protectedProcedure
    .input(
      z.object({
        studentName: z.string(),
        courseName: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await sendAdminNewSaleEmail(
        input.studentName,
        input.courseName,
        input.amount
      );
      return { success };
    }),
});
