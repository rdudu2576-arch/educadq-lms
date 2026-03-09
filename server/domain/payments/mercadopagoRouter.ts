import { router, protectedProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import {
  createMercadoPagoCheckout,
  createCardPayment,
  createPixPayment,
  createBoletoPayment,
  createTransferPayment,
  getPaymentStatus,
} from "../../services/mercadopagoComplete.js";

export const mercadopagoRouter = router({
  /**
   * Criar checkout com todas as opções de pagamento
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseName: z.string(),
        coursePrice: z.number(),
        installments: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const checkoutUrl = await createMercadoPagoCheckout({
        courseId: input.courseId,
        courseName: input.courseName,
        coursePrice: input.coursePrice,
        studentEmail: ctx.user.email || "",
        studentName: ctx.user.name || "",
        successUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/success?courseId=${input.courseId}`,
        cancelUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment/cancel`,
        installments: input.installments || 1,
      });

      if (!checkoutUrl) {
        throw new Error("Erro ao criar checkout");
      }

      return { checkoutUrl };
    }),

  /**
   * Criar pagamento com cartão de crédito
   */
  createCardPayment: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        courseName: z.string(),
        coursePrice: z.number(),
        cardToken: z.string(),
        installments: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const result = await createCardPayment(
        input.courseId,
        input.courseName,
        input.coursePrice,
        input.cardToken,
        ctx.user.email || "",
        ctx.user.name || "",
        input.installments || 1
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao processar pagamento");
      }

      return result;
    }),

  /**
   * Criar pagamento com PIX
   */
  createPixPayment: protectedProcedure
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

      const result = await createPixPayment(
        input.courseId,
        input.courseName,
        input.coursePrice,
        ctx.user.email || "",
        ctx.user.name || ""
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar PIX");
      }

      return result;
    }),

  /**
   * Criar pagamento com Boleto
   */
  createBoletoPayment: protectedProcedure
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

      const result = await createBoletoPayment(
        input.courseId,
        input.courseName,
        input.coursePrice,
        ctx.user.email || "",
        ctx.user.name || ""
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar boleto");
      }

      return result;
    }),

  /**
   * Criar pagamento com Transferência Bancária
   */
  createTransferPayment: protectedProcedure
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

      const result = await createTransferPayment(
        input.courseId,
        input.courseName,
        input.coursePrice,
        ctx.user.email || "",
        ctx.user.name || ""
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar transferência");
      }

      return result;
    }),

  /**
   * Obter status de um pagamento
   */
  getPaymentStatus: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ input }) => {
      const status = await getPaymentStatus(input.paymentId);

      if (!status) {
        throw new Error("Pagamento não encontrado");
      }

      return status;
    }),
});
