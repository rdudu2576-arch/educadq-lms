import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export interface CheckoutSessionParams {
  userId: number;
  courseId: number;
  courseName: string;
  coursePrice: number;
  userEmail: string;
  userName: string;
  successUrl: string;
  cancelUrl: string;
  origin?: string;
}

/**
 * Cria uma sessão de checkout no Stripe
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: params.courseName,
              description: `Acesso ao curso: ${params.courseName}`,
            },
            unit_amount: Math.round(params.coursePrice * 100), // Converter para centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: params.userEmail,
      client_reference_id: params.userId.toString(),
      metadata: {
        userId: params.userId.toString(),
        courseId: params.courseId.toString(),
        userName: params.userName,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
    });

    return session.url;
  } catch (error) {
    console.error("[Stripe] Erro ao criar sessão de checkout:", error);
    return null;
  }
}

/**
 * Recupera informações de uma sessão de checkout
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("[Stripe] Erro ao recuperar sessão:", error);
    return null;
  }
}

/**
 * Cria ou obtém um cliente Stripe
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  userId: number
): Promise<string | null> {
  try {
    // Buscar cliente existente
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0].id;
    }

    // Criar novo cliente
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId.toString(),
      },
    });

    return customer.id;
  } catch (error) {
    console.error("[Stripe] Erro ao criar/obter cliente:", error);
    return null;
  }
}

/**
 * Recupera o histórico de pagamentos de um cliente
 */
export async function getCustomerPayments(customerId: string): Promise<Stripe.PaymentIntent[]> {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });

    return paymentIntents.data;
  } catch (error) {
    console.error("[Stripe] Erro ao recuperar pagamentos:", error);
    return [];
  }
}

/**
 * Obtém detalhes de um pagamento
 */
export async function getPaymentDetails(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("[Stripe] Erro ao recuperar detalhes do pagamento:", error);
    return null;
  }
}

/**
 * Reembolsa um pagamento
 */
export async function refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund | null> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });

    return refund;
  } catch (error) {
    console.error("[Stripe] Erro ao reembolsar pagamento:", error);
    return null;
  }
}
