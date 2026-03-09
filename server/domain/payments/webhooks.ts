import { publicProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { getMercadoPagoPayment } from "./mercadopago.js";
import { updatePayment, enrollStudent, getPaymentsByStudent } from "../../infra/db.js";
import { TRPCError } from "@trpc/server";

interface MercadoPagoWebhookPayload {
  action: string;
  data: {
    id: string;
  };
  type: string;
}

/**
 * Handle Mercado Pago webhook notifications
 * Called when payment status changes
 */
export const webhooksRouter = router({
  mercadoPago: publicProcedure
    .input(
      z.object({
        action: z.string(),
        data: z.object({
          id: z.string(),
        }),
        type: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        // Only process payment notifications
        if (input.type !== "payment") {
          return { success: true, message: "Notification type not payment" };
        }

        // Get payment details from Mercado Pago
        const mpPayment = await getMercadoPagoPayment(input.data.id);

        // Find the payment in our database using external_reference
        if (!mpPayment.external_reference) {
          throw new Error("No external_reference in Mercado Pago payment");
        }

        const [studentIdStr, courseIdStr] = mpPayment.external_reference.split("_");
        const studentId = parseInt(studentIdStr);
        const courseId = parseInt(courseIdStr);

        if (isNaN(studentId) || isNaN(courseId)) {
          throw new Error("Invalid external_reference format");
        }

        // Update payment status based on Mercado Pago status
        let paymentStatus: "pending" | "paid" | "overdue" | "cancelled" = "pending";
        if (mpPayment.status === "approved") {
          paymentStatus = "paid";
        } else if (mpPayment.status === "rejected") {
          paymentStatus = "cancelled";
        } else if (mpPayment.status === "pending") {
          paymentStatus = "pending";
        }

        // Update payment in database
        await updatePayment(parseInt(input.data.id), {
          status: paymentStatus,
          paidAt: paymentStatus === "paid" ? new Date() : null,
        });

        // If payment is approved, automatically enroll student
        if (paymentStatus === "paid") {
          try {
            await enrollStudent(studentId, courseId);
          } catch (enrollError) {
            console.error("Error enrolling student:", enrollError);
            // Don't fail the webhook if enrollment fails
            // The admin can manually enroll if needed
          }
        }

        return {
          success: true,
          message: `Payment ${input.data.id} processed successfully`,
          status: paymentStatus,
        };
      } catch (error) {
        console.error("Webhook error:", error);
        // Return success to Mercado Pago to avoid retries
        // Log the error for manual review
        return {
          success: true,
          message: "Webhook processed with error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Verify payment status and trigger enrollment if needed
   * Called by frontend after payment redirect
   */
  verifyPayment: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
        studentId: z.number(),
        courseId: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        // Get payment details from Mercado Pago
        const mpPayment = await getMercadoPagoPayment(input.paymentId);

        // Check if payment is approved
        if (mpPayment.status === "approved") {
          // Enroll student if not already enrolled
          try {
            await enrollStudent(input.studentId, input.courseId);
          } catch (enrollError) {
            // Student might already be enrolled
            console.log("Enrollment info:", enrollError);
          }

          return {
            success: true,
            status: "approved",
            message: "Pagamento confirmado! Você já tem acesso ao curso.",
            redirect: `/student`,
          };
        } else if (mpPayment.status === "pending") {
          return {
            success: true,
            status: "pending",
            message: "Pagamento em análise. Você receberá uma confirmação em breve.",
            redirect: `/student`,
          };
        } else {
          return {
            success: false,
            status: mpPayment.status,
            message: "Pagamento não foi aprovado. Tente novamente.",
            redirect: `/checkout/${input.courseId}`,
          };
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        return {
          success: false,
          status: "error",
          message: "Erro ao verificar pagamento. Tente novamente.",
          redirect: `/checkout/${input.courseId}`,
        };
      }
    }),
});
