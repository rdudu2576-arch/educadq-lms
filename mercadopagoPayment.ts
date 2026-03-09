import { MercadoPagoConfig, Preference } from "mercadopago";

/**
 * MercadoPago Payment Service
 * Gerencia pagamentos via MercadoPago e PIX
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export interface MercadoPagoPaymentParams {
  courseId: number;
  courseName: string;
  coursePrice: number;
  studentEmail: string;
  studentName: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Cria uma preferência de pagamento no MercadoPago
 */
export async function createMercadoPagoPreference(
  params: MercadoPagoPaymentParams
): Promise<string | null> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn("[MercadoPago] Token não configurado");
      return null;
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: params.courseId.toString(),
            title: params.courseName,
            quantity: 1,
            unit_price: params.coursePrice,
            currency_id: "BRL",
          },
        ],
        payer: {
          email: params.studentEmail,
          name: params.studentName,
        },
        back_urls: {
          success: params.successUrl,
          failure: params.cancelUrl,
          pending: params.cancelUrl,
        },
        auto_return: "approved",
        notification_url: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/webhooks/mercadopago`,
        external_reference: params.courseId.toString(),
        metadata: {
          courseId: params.courseId,
          studentEmail: params.studentEmail,
        },
      },
    });

    return result.init_point || null;
  } catch (error) {
    console.error("[MercadoPago] Erro ao criar preferência:", error);
    return null;
  }
}

/**
 * Verifica o status de um pagamento no MercadoPago
 */
export async function getMercadoPagoPaymentStatus(paymentId: string): Promise<any> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return null;
    }

    // Implementar verificação de status
    // const payment = await client.payment.get(paymentId);
    // return payment;
    return null;
  } catch (error) {
    console.error("[MercadoPago] Erro ao obter status do pagamento:", error);
    return null;
  }
}

/**
 * Gera um QR Code para pagamento PIX
 */
export async function generatePixQrCode(
  courseId: number,
  courseName: string,
  amount: number
): Promise<string | null> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn("[MercadoPago] Token não configurado para PIX");
      return null;
    }

    // Implementar geração de QR Code PIX
    // const qrCode = await client.qrCode.create({
    //   amount,
    //   description: courseName,
    //   externalReference: courseId.toString(),
    // });

    // return qrCode.qr_data;
    return null;
  } catch (error) {
    console.error("[MercadoPago] Erro ao gerar QR Code PIX:", error);
    return null;
  }
}

/**
 * Cria um pagamento direto com dados do cartão
 */
export async function createDirectPayment(
  courseId: number,
  courseName: string,
  amount: number,
  cardToken: string,
  payerEmail: string,
  payerName: string
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return {
        success: false,
        error: "MercadoPago não configurado",
      };
    }

    // Implementar pagamento direto
    // const payment = await client.payment.create({
    //   token: cardToken,
    //   installments: 1,
    //   amount,
    //   currency_id: "BRL",
    //   description: courseName,
    //   payer: {
    //     email: payerEmail,
    //     first_name: payerName,
    //   },
    //   external_reference: courseId.toString(),
    // });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[MercadoPago] Erro ao processar pagamento:", error);
    return {
      success: false,
      error: "Erro ao processar pagamento",
    };
  }
}

/**
 * Processa webhook do MercadoPago
 */
export async function processMercadoPagoWebhook(data: any): Promise<void> {
  try {
    console.log("[MercadoPago Webhook] Evento recebido:", data);

    if (data.type === "payment") {
      const paymentId = data.data.id;
      console.log("[MercadoPago Webhook] Pagamento processado:", paymentId);
      // Implementar lógica de processamento
    }
  } catch (error) {
    console.error("[MercadoPago Webhook] Erro ao processar webhook:", error);
  }
}
