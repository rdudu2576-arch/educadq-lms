import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";
import { notifyOwner } from "../../_core/notification";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";

export interface MercadoPagoWebhook {
  id: string;
  type: string;
  data: {
    id: string;
  };
  action: string;
}

export async function handleMercadoPagoWebhook(webhook: MercadoPagoWebhook) {
  try {
    // Validar tipo de evento
    if (webhook.type !== "payment") {
      console.log("[Webhook] Ignorando evento:", webhook.type);
      return { success: true };
    }

    // Buscar detalhes do pagamento na API do Mercado Pago
    const paymentDetails = await fetchMercadoPagoPayment(webhook.data.id);

    if (!paymentDetails) {
      throw new Error("Payment details not found");
    }

    // Extrair referência externa (payment_id do nosso sistema)
    const externalReference = paymentDetails.external_reference;
    if (!externalReference || !externalReference.startsWith("payment_")) {
      console.log("[Webhook] Referência externa inválida:", externalReference);
      return { success: true };
    }

    const paymentId = parseInt(externalReference.replace("payment_", ""));

    // Buscar pagamento no banco
    const payment = await db.getPaymentById(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found in database`);
    }

    // Determinar status baseado no status do Mercado Pago
    let newStatus: "pending" | "paid" | "overdue" | "cancelled";

    switch (paymentDetails.status) {
      case "approved":
        newStatus = "paid";
        break;
      case "pending":
        newStatus = "pending";
        break;
      case "rejected":
      case "cancelled":
        newStatus = "cancelled";
        break;
      case "in_process":
        newStatus = "pending";
        break;
      default:
        newStatus = "pending";
    }

    // Atualizar pagamento no banco
    await db.updatePaymentStatus(paymentId, newStatus, {
      transactionId: webhook.data.id,
      paidAt: newStatus === "paid" ? new Date() : undefined,
    });

    // Se pagamento foi aprovado, liberar acesso ao curso
    if (newStatus === "paid") {
      // Verificar se aluno já está matriculado
      const enrollment = await db.getEnrollmentByStudentAndCourse(
        payment.studentId,
        payment.courseId
      );

      if (!enrollment) {
        // Criar matrícula
        await db.createEnrollment({
          studentId: payment.studentId,
          courseId: payment.courseId,
          enrollmentDate: new Date(),
          status: "active",
        });
      } else if (enrollment.status !== "active") {
        // Ativar matrícula
        await db.updateEnrollmentStatus(enrollment.id, "active");
      }

      // Notificar admin
      await notifyOwner({
        title: "Pagamento Aprovado",
        content: `Pagamento de R$ ${payment.amount} foi aprovado. Aluno agora tem acesso ao curso.`,
      });
    }

    // Se pagamento foi rejeitado, notificar
    if (newStatus === "cancelled") {
      await notifyOwner({
        title: "Pagamento Rejeitado",
        content: `Pagamento de R$ ${payment.amount} foi rejeitado. Motivo: ${paymentDetails.status_detail}`,
      });
    }

    console.log(`[Webhook] Pagamento ${paymentId} atualizado para ${newStatus}`);

    return { success: true, status: newStatus };
  } catch (error) {
    console.error("[Webhook Error]", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Webhook processing failed",
    });
  }
}

async function fetchMercadoPagoPayment(paymentId: string) {
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Mercado Pago API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Mercado Pago API Error]", error);
    throw error;
  }
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  // Implementar verificação de assinatura do Mercado Pago
  // Para produção, usar a chave pública do Mercado Pago
  try {
    // Placeholder - implementar verificação real
    return true;
  } catch (error) {
    console.error("[Signature Verification Error]", error);
    return false;
  }
}
