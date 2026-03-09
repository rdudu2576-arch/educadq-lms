import { router, publicProcedure } from "../../_core/trpc";
import { z } from "zod";
import { handleMercadoPagoWebhook, verifyWebhookSignature } from "./webhookHandler";

export const webhookRouter = router({
  mercadoPago: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string(),
        data: z.object({
          id: z.string(),
        }),
        action: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Processar webhook
      const result = await handleMercadoPagoWebhook(input);
      return result;
    }),

  stripeWebhook: publicProcedure
    .input(
      z.object({
        type: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      // Placeholder para Stripe
      console.log("[Webhook] Stripe event:", input.type);
      return { success: true };
    }),

  paypalWebhook: publicProcedure
    .input(
      z.object({
        event_type: z.string(),
        resource: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      // Placeholder para PayPal
      console.log("[Webhook] PayPal event:", input.event_type);
      return { success: true };
    }),
});
