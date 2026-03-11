import { TRPCError } from "@trpc/server";

export interface PaymentProviderInterface {
  name: string;
  type: string;
  createPayment(data: any): Promise<any>;
  getPaymentStatus(paymentId: string): Promise<any>;
  refundPayment(paymentId: string): Promise<any>;
  validateCredentials(credentials: any): Promise<boolean>;
}

class MercadoPagoProvider implements PaymentProviderInterface {
  name = "Mercado Pago";
  type = "mercado_pago";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPayment(data: {
    amount: number;
    description: string;
    paymentMethod: string;
    installments: number;
    email: string;
  }): Promise<any> {
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          items: [
            {
              title: data.description,
              quantity: 1,
              unit_price: data.amount,
            },
          ],
          payer: { email: data.email },
          payment_methods: {
            installments: data.installments,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create payment");
    }

    return await response.json();
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get payment status");
    }

    return await response.json();
  }

  async refundPayment(paymentId: string): Promise<any> {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to refund payment");
    }

    return await response.json();
  }

  async validateCredentials(credentials: any): Promise<boolean> {
    try {
      const response = await fetch("https://api.mercadopago.com/v1/accounts/me", {
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

class StripeProvider implements PaymentProviderInterface {
  name = "Stripe";
  type = "stripe";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPayment(data: any): Promise<any> {
    // Implementação Stripe
    throw new Error("Stripe provider not yet implemented");
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    throw new Error("Stripe provider not yet implemented");
  }

  async refundPayment(paymentId: string): Promise<any> {
    throw new Error("Stripe provider not yet implemented");
  }

  async validateCredentials(credentials: any): Promise<boolean> {
    try {
      const response = await fetch("https://api.stripe.com/v1/account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

class PayPalProvider implements PaymentProviderInterface {
  name = "PayPal";
  type = "paypal";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPayment(data: any): Promise<any> {
    // Implementação PayPal
    throw new Error("PayPal provider not yet implemented");
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    throw new Error("PayPal provider not yet implemented");
  }

  async refundPayment(paymentId: string): Promise<any> {
    throw new Error("PayPal provider not yet implemented");
  }

  async validateCredentials(credentials: any): Promise<boolean> {
    return credentials.apiKey && credentials.apiKey.length > 10;
  }
}

export class PaymentProviderFactory {
  private static activeProvider: PaymentProviderInterface | null = null;
  private static providers: Map<string, PaymentProviderInterface> = new Map();

  static registerProvider(provider: PaymentProviderInterface): void {
    this.providers.set(provider.type, provider);
  }

  static setActiveProvider(providerType: string, apiKey: string): void {
    let provider: PaymentProviderInterface;

    switch (providerType) {
      case "mercado_pago":
        provider = new MercadoPagoProvider(apiKey);
        break;
      case "stripe":
        provider = new StripeProvider(apiKey);
        break;
      case "paypal":
        provider = new PayPalProvider(apiKey);
        break;
      default:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unknown provider type: ${providerType}`,
        });
    }

    this.activeProvider = provider;
    this.registerProvider(provider);
  }

  static getActiveProvider(): PaymentProviderInterface {
    if (!this.activeProvider) {
      // Default para Mercado Pago
      const apiKey = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
      this.setActiveProvider("mercado_pago", apiKey);
    }

    if (!this.activeProvider) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No payment provider configured",
      });
    }

    return this.activeProvider;
  }

  static getProvider(providerType: string): PaymentProviderInterface {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Provider ${providerType} not found`,
      });
    }
    return provider;
  }

  static getAllProviders(): PaymentProviderInterface[] {
    return Array.from(this.providers.values());
  }
}

// Inicializar com provedor padrão
PaymentProviderFactory.setActiveProvider(
  "mercado_pago",
  process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
);
