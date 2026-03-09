import { ENV } from "../../_core/env.js";
import crypto from "crypto";

interface MercadoPagoPreference {
  items: Array<{
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }>;
  payer: {
    email: string;
    name?: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: "approved" | "all";
  external_reference?: string;
  notification_url?: string;
}

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference?: string;
  transaction_amount: number;
  payer: {
    email: string;
    id: string;
  };
}

/**
 * Create a Mercado Pago preference for checkout
 */
export async function createMercadoPagoPreference(
  preference: MercadoPagoPreference
): Promise<{ id: string; init_point: string }> {
  if (!ENV.mercadoPagoAccessToken) {
    throw new Error("mercadoPagoAccessToken not configured");
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.mercadoPagoAccessToken}`,
    },
    body: JSON.stringify(preference),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    init_point: data.init_point,
  };
}

/**
 * Get payment details from Mercado Pago
 */
export async function getMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  if (!ENV.mercadoPagoAccessToken) {
    throw new Error("mercadoPagoAccessToken not configured");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ENV.mercadoPagoAccessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Verify Mercado Pago webhook signature
 */
export function verifyMercadoPagoWebhook(
  body: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) return false;

  // Mercado Pago uses HMAC-SHA256 for webhook verification
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return hash === signature;
}

/**
 * Test Mercado Pago connection
 */
export async function testMercadoPagoConnection(): Promise<boolean> {
  if (!ENV.mercadoPagoAccessToken) {
    throw new Error("mercadoPagoAccessToken not configured");
  }

  try {
    const response = await fetch("https://api.mercadopago.com/v1/accounts/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ENV.mercadoPagoAccessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Mercado Pago connection test failed:", error);
    return false;
  }
}
