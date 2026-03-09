import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { createCheckoutSession } from "../../services/stripeCheckout";
import { createMercadoPagoPreference } from "../../services/mercadopagoPayment";
import { getDb } from "../../infra/db";
import { payments } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const paymentRouter = router({
  /**
   * Criar sessão de checkout Stripe
   */
  createStripeCheckout: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseName: z.string(),
        coursePrice: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const checkoutUrl = await createCheckoutSession({
        userId: ctx.user.id,
        courseId: input.courseId,
        courseName: input.courseName,
        coursePrice: input.coursePrice,
        userEmail: ctx.user.email || "",
        userName: ctx.user.name || "",
        successUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/success?courseId=${input.courseId}`,
        cancelUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/cancel`,
      });

      if (!checkoutUrl) {
        throw new Error("Erro ao criar sessão de checkout");
      }

      return { checkoutUrl };
    }),

  /**
   * Criar preferência de pagamento MercadoPago
   */
  createMercadoPagoCheckout: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseName: z.string(),
        coursePrice: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const preferenceUrl = await createMercadoPagoPreference({
        courseId: input.courseId,
        courseName: input.courseName,
        coursePrice: input.coursePrice,
        studentEmail: ctx.user.email || "",
        studentName: ctx.user.name || "",
        successUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/success?courseId=${input.courseId}`,
        cancelUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/cancel`,
      });

      if (!preferenceUrl) {
        throw new Error("Erro ao criar preferência de pagamento");
      }

      return { preferenceUrl };
    }),

  /**
   * Obter histórico de pagamentos do usuário
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Usuário não autenticado");
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Erro ao conectar ao banco de dados");
      }

      const userPayments = await db.query.payments.findMany({
        where: eq(payments.studentId, ctx.user.id),
      });

      return userPayments;
    } catch (error) {
      console.error("[Payment Router] Erro ao obter histórico:", error);
      throw new Error("Erro ao obter histórico de pagamentos");
    }
  }),

  /**
   * Obter status de um pagamento
   */
  getPaymentStatus: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Erro ao conectar ao banco de dados");
        }

        const payment = await db.query.payments.findFirst({
          where: and(eq(payments.id, input.paymentId), eq(payments.studentId, ctx.user.id)),
        });

        if (!payment) {
          throw new Error("Pagamento não encontrado");
        }

        return payment;
      } catch (error) {
        console.error("[Payment Router] Erro ao obter status:", error);
        throw new Error("Erro ao obter status do pagamento");
      }
    }),

  /**
   * Registrar pagamento manual (PIX, transferência, etc)
   */
  registerManualPayment: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        amount: z.number(),
        paymentMethod: z.enum(["pix", "transfer", "cash"]),
        reference: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Erro ao conectar ao banco de dados");
        }

        // Criar registro de pagamento pendente
        const result = await db.insert(payments).values({
          studentId: ctx.user.id,
          courseId: input.courseId,
          amount: input.amount.toString(),
          status: "pending",
          transactionId: input.reference || `manual-${Date.now()}`,
        });

        return {
          success: true,
          message: "Pagamento registrado. Aguardando confirmação.",
        };
      } catch (error) {
        console.error("[Payment Router] Erro ao registrar pagamento:", error);
        throw new Error("Erro ao registrar pagamento");
      }
    }),
});
