import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../infra/db.js";
import { payments } from "../infra/schema.pg.js";
import { eq, and } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Processa eventos do webhook do Stripe
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("[Stripe Webhook] Erro ao verificar assinatura:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Detectar eventos de teste
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Evento de teste detectado:", event.type);
    res.json({ verified: true });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Stripe Webhook] Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Erro ao processar evento:", error);
    res.status(500).json({ error: "Erro ao processar webhook" });
  }
}

/**
 * Processa checkout.session.completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log("[Stripe Webhook] Checkout concluído:", session.id);

  const userId = parseInt(session.client_reference_id || "0");
  const courseId = parseInt(session.metadata?.courseId || "0");

  if (!userId || !courseId) {
    console.error("[Stripe Webhook] Dados inválidos no metadata");
    return;
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Stripe Webhook] Erro ao conectar ao banco de dados");
      return;
    }

    // Atualizar pagamento como pago
    await db
      .update(payments)
      .set({
        status: "paid",
        transactionId: session.payment_intent?.toString(),
        paidAt: new Date(),
       } as any)
      .where(and(eq(payments.studentId, userId), eq(payments.courseId, courseId)));

    console.log(`[Stripe Webhook] Pagamento processado para aluno ${userId}`);
  } catch (error) {
    console.error("[Stripe Webhook] Erro ao processar checkout concluído:", error);
  }
}

/**
 * Processa payment_intent.succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log("[Stripe Webhook] Pagamento bem-sucedido:", paymentIntent.id);

  if (!paymentIntent.metadata?.userId || !paymentIntent.metadata?.courseId) {
    console.error("[Stripe Webhook] Metadata inválida no payment intent");
    return;
  }

  try {
    const db = await getDb();
    if (!db) return;

    const userId = parseInt(paymentIntent.metadata.userId);
    const courseId = parseInt(paymentIntent.metadata.courseId);

    // Atualizar pagamento
    await db
      .update(payments)
      .set({
        status: "paid",
        transactionId: paymentIntent.id,
        paidAt: new Date(),
       } as any)
      .where(and(eq(payments.studentId, userId), eq(payments.courseId, courseId)));
  } catch (error) {
    console.error("[Stripe Webhook] Erro ao processar payment succeeded:", error);
  }
}

/**
 * Processa payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log("[Stripe Webhook] Pagamento falhou:", paymentIntent.id);

  if (!paymentIntent.metadata?.userId || !paymentIntent.metadata?.courseId) {
    return;
  }

  try {
    const db = await getDb();
    if (!db) return;

    const userId = parseInt(paymentIntent.metadata.userId);
    const courseId = parseInt(paymentIntent.metadata.courseId);

    // Atualizar pagamento como pendente
    await db
      .update(payments)
      .set({
        status: "pending",
        transactionId: paymentIntent.id,
       } as any)
      .where(and(eq(payments.studentId, userId), eq(payments.courseId, courseId)));
  } catch (error) {
    console.error("[Stripe Webhook] Erro ao processar payment failed:", error);
  }
}

/**
 * Processa customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Stripe Webhook] Subscrição cancelada:", subscription.id);
  // Implementar lógica de cancelamento se necessário
}
