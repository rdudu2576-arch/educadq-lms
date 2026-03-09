import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * MercadoPago Complete Payment Service
 * Integração completa com todas as opções de pagamento do MercadoPago
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export interface MercadoPagoCheckoutParams {
  courseId: number;
  courseName: string;
  coursePrice: number;
  studentEmail: string;
  studentName: string;
  successUrl: string;
  cancelUrl: string;
  installments?: number;
}

/**
 * Cria uma preferência de pagamento com TODAS as opções do MercadoPago
 * - Cartão de crédito/débito
 * - PIX
 * - Boleto
 * - Transferência bancária
 * - Parcelamento
 * - Wallet do MercadoPago
 */
export async function createMercadoPagoCheckout(
  params: MercadoPagoCheckoutParams
): Promise<string | null> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.warn("[MercadoPago] Token não configurado");
      return null;
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        // Itens do pedido
        items: [
          {
        id: params.courseId.toString(),
        title: params.courseName,
        quantity: 1,
        unit_price: params.coursePrice as any,
            currency_id: "BRL",
            description: `Acesso ao curso ${params.courseName}`,
          },
        ],

        // Dados do pagador
        payer: {
          email: params.studentEmail,
          name: params.studentName,
          phone: {
            area_code: "11",
            number: "0000000000",
          },
          address: {
            zip_code: "00000000",
            street_name: "Rua",
            street_number: "0",
          },
        },

        // URLs de retorno
        back_urls: {
          success: params.successUrl,
          failure: params.cancelUrl,
          pending: params.cancelUrl,
        },

        // Configurações de pagamento
        auto_return: "approved",
        binary_mode: false, // Permite múltiplas tentativas
        notification_url: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/webhooks/mercadopago`,

        // Referência externa
        external_reference: params.courseId.toString(),

        // Metadados
        metadata: {
          courseId: params.courseId,
          studentEmail: params.studentEmail,
          studentName: params.studentName,
        },
      },
    });

    if (result.init_point) {
      console.log("[MercadoPago] Preferência criada com sucesso:", result.id);
      return result.init_point;
    }

    return null;
  } catch (error) {
    console.error("[MercadoPago] Erro ao criar preferência:", error);
    return null;
  }
}

/**
 * Cria um pagamento direto com cartão de crédito
 */
export async function createCardPayment(
  courseId: number,
  courseName: string,
  amount: number,
  cardToken: string,
  payerEmail: string,
  payerName: string,
  installments: number = 1
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return {
        success: false,
        error: "MercadoPago não configurado",
      };
    }

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: amount,
        token: cardToken,
        installments: installments,
        payment_method_id: "credit_card",
        payer: {
          email: payerEmail,
          first_name: payerName.split(" ")[0],
          last_name: payerName.split(" ").slice(1).join(" ") || ".",
        },
        description: courseName,
        external_reference: courseId.toString(),
      } as any,
    });

    if (result.id) {
      console.log("[MercadoPago] Pagamento com cartão criado:", result.id);
      return {
        success: true,
        paymentId: result.id.toString(),
      };
    }

    return {
      success: false,
      error: "Erro ao processar pagamento",
    };
  } catch (error: any) {
    console.error("[MercadoPago] Erro ao processar pagamento com cartão:", error);
    return {
      success: false,
      error: error.message || "Erro ao processar pagamento",
    };
  }
}

/**
 * Cria um pagamento com PIX
 */
export async function createPixPayment(
  courseId: number,
  courseName: string,
  amount: number,
  payerEmail: string,
  payerName: string
): Promise<{ success: boolean; qrCode?: string; copyPaste?: string; error?: string }> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return {
        success: false,
        error: "MercadoPago não configurado",
      };
    }

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: amount,
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: payerName.split(" ")[0],
          last_name: payerName.split(" ").slice(1).join(" ") || ".",
        },
        description: courseName,
        external_reference: courseId.toString(),
      },
    });

    if (result.point_of_interaction?.transaction_data) {
      const qrCode = result.point_of_interaction.transaction_data.qr_code;
      const copyPaste = result.point_of_interaction.transaction_data.qr_code;

      console.log("[MercadoPago] Pagamento PIX criado:", result.id);
      return {
        success: true,
        qrCode,
        copyPaste,
      };
    }

    return {
      success: false,
      error: "Erro ao gerar QR Code PIX",
    };
  } catch (error: any) {
    console.error("[MercadoPago] Erro ao criar pagamento PIX:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar pagamento PIX",
    };
  }
}

/**
 * Cria um pagamento com Boleto
 */
export async function createBoletoPayment(
  courseId: number,
  courseName: string,
  amount: number,
  payerEmail: string,
  payerName: string
): Promise<{ success: boolean; boletoUrl?: string; barcode?: string; error?: string }> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return {
        success: false,
        error: "MercadoPago não configurado",
      };
    }

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: amount,
        payment_method_id: "bolbradesco",
        payer: {
          email: payerEmail,
          first_name: payerName.split(" ")[0],
          last_name: payerName.split(" ").slice(1).join(" ") || ".",
        },
        description: courseName,
        external_reference: courseId.toString(),
      },
    });

      if (result.transaction_details?.external_resource_url) {
        console.log("[MercadoPago] Boleto criado:", result.id);
        return {
          success: true,
          boletoUrl: result.transaction_details.external_resource_url,
        };
    }

    return {
      success: false,
      error: "Erro ao gerar boleto",
    };
  } catch (error: any) {
    console.error("[MercadoPago] Erro ao criar boleto:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar boleto",
    };
  }
}

/**
 * Cria um pagamento com Transferência Bancária
 */
export async function createTransferPayment(
  courseId: number,
  courseName: string,
  amount: number,
  payerEmail: string,
  payerName: string
): Promise<{ success: boolean; bankInfo?: any; error?: string }> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return {
        success: false,
        error: "MercadoPago não configurado",
      };
    }

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: amount,
        payment_method_id: "bank_transfer",
        payer: {
          email: payerEmail,
          first_name: payerName.split(" ")[0],
          last_name: payerName.split(" ").slice(1).join(" ") || ".",
        },
        description: courseName,
        external_reference: courseId.toString(),
      },
    });

    if (result.id) {
      console.log("[MercadoPago] Transferência bancária criada:", result.id);
      return {
        success: true,
        bankInfo: {
          paymentId: result.id,
          status: result.status,
          amount: result.transaction_amount,
        },
      };
    }

    return {
      success: false,
      error: "Erro ao criar transferência bancária",
    };
  } catch (error: any) {
    console.error("[MercadoPago] Erro ao criar transferência:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar transferência",
    };
  }
}

/**
 * Obtém o status de um pagamento
 */
export async function getPaymentStatus(paymentId: string): Promise<any> {
  try {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return null;
    }

    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });

    return {
      id: result.id,
      status: result.status,
      amount: result.transaction_amount,
      paymentMethod: result.payment_method_id,
      createdAt: result.date_created,
    };
  } catch (error) {
    console.error("[MercadoPago] Erro ao obter status:", error);
    return null;
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
      const status = await getPaymentStatus(paymentId);

      if (status?.status === "approved") {
        console.log("[MercadoPago Webhook] Pagamento aprovado:", paymentId);
        // Implementar lógica de aprovação
      } else if (status?.status === "pending") {
        console.log("[MercadoPago Webhook] Pagamento pendente:", paymentId);
        // Implementar lógica de pendência
      } else if (status?.status === "rejected") {
        console.log("[MercadoPago Webhook] Pagamento rejeitado:", paymentId);
        // Implementar lógica de rejeição
      }
    }
  } catch (error) {
    console.error("[MercadoPago Webhook] Erro ao processar webhook:", error);
  }
}
