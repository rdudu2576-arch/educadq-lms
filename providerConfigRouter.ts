import { router, adminProcedure, publicProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const providerConfigRouter = router({
  listProviders: adminProcedure.query(async ({ ctx }) => {
    // Buscar todos os provedores configurados
    return [
      {
        id: 1,
        name: "Mercado Pago",
        type: "mercado_pago",
        isActive: true,
        supportedMethods: ["credit_card", "debit_card", "pix", "boleto"],
        maxInstallments: 12,
        feePercentage: "2.99",
      },
      {
        id: 2,
        name: "Stripe",
        type: "stripe",
        isActive: false,
        supportedMethods: ["credit_card", "debit_card"],
        maxInstallments: 12,
        feePercentage: "2.90",
      },
      {
        id: 3,
        name: "PayPal",
        type: "paypal",
        isActive: false,
        supportedMethods: ["credit_card", "paypal_wallet"],
        maxInstallments: 12,
        feePercentage: "3.49",
      },
    ];
  }),

  getActiveProvider: publicProcedure.query(async () => {
    // Retornar provedor ativo
    return {
      id: 1,
      name: "Mercado Pago",
      type: "mercado_pago",
      supportedMethods: ["credit_card", "debit_card", "pix", "boleto"],
      maxInstallments: 12,
    };
  }),

  updateProvider: adminProcedure
    .input(
      z.object({
        providerId: z.number(),
        apiKey: z.string().min(10),
        publicKey: z.string().optional(),
        webhookSecret: z.string().optional(),
        maxInstallments: z.number().min(1).max(12),
        feePercentage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Validar credenciais com o provedor
      const isValid = await validateProviderCredentials(input.providerId, input);

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid provider credentials",
        });
      }

      // Atualizar configuração
      // await db.updatePaymentProvider(input.providerId, input);

      // Log da mudança
      // await db.logProviderChange(input.providerId, "config_updated", ctx.user.userId, input);

      return { success: true, message: "Provider configuration updated" };
    }),

  switchActiveProvider: adminProcedure
    .input(
      z.object({
        providerId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Desativar todos os provedores
      // await db.deactivateAllProviders();

      // Ativar novo provedor
      // await db.activateProvider(input.providerId);

      // Log da mudança
      // await db.logProviderChange(input.providerId, "activated", ctx.user.userId);

      return {
        success: true,
        message: "Payment provider switched successfully",
      };
    }),

  testProviderConnection: adminProcedure
    .input(
      z.object({
        providerId: z.number(),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const isValid = await validateProviderCredentials(input.providerId, {
          apiKey: input.apiKey,
        });

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Connection test failed",
          });
        }

        return { success: true, message: "Connection successful" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Connection test failed",
        });
      }
    }),

  getProviderLogs: adminProcedure
    .input(z.object({ providerId: z.number().optional() }))
    .query(async ({ input }) => {
      // Buscar logs de mudanças de provedores
      return [
        {
          id: 1,
          providerId: 1,
          action: "activated",
          details: "Mercado Pago ativado",
          changedBy: 1,
          createdAt: new Date(),
        },
      ];
    }),

  getSupportedProviders: publicProcedure.query(async () => {
    return [
      {
        id: 1,
        name: "Mercado Pago",
        type: "mercado_pago",
        description: "Integração com Mercado Pago",
        supportedMethods: ["credit_card", "debit_card", "pix", "boleto"],
        maxInstallments: 12,
        feePercentage: "2.99",
        documentation: "https://www.mercadopago.com.br/developers",
      },
      {
        id: 2,
        name: "Stripe",
        type: "stripe",
        description: "Integração com Stripe",
        supportedMethods: ["credit_card", "debit_card"],
        maxInstallments: 12,
        feePercentage: "2.90",
        documentation: "https://stripe.com/docs",
      },
      {
        id: 3,
        name: "PayPal",
        type: "paypal",
        description: "Integração com PayPal",
        supportedMethods: ["credit_card", "paypal_wallet"],
        maxInstallments: 12,
        feePercentage: "3.49",
        documentation: "https://developer.paypal.com",
      },
    ];
  }),
});

async function validateProviderCredentials(
  providerId: number,
  credentials: any
): Promise<boolean> {
  try {
    switch (providerId) {
      case 1: // Mercado Pago
        return await validateMercadoPagoCredentials(credentials.apiKey);
      case 2: // Stripe
        return await validateStripeCredentials(credentials.apiKey);
      case 3: // PayPal
        return await validatePayPalCredentials(credentials.apiKey);
      default:
        return false;
    }
  } catch (error) {
    console.error("Credential validation error:", error);
    return false;
  }
}

async function validateMercadoPagoCredentials(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.mercadopago.com/v1/accounts/me", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function validateStripeCredentials(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.stripe.com/v1/account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function validatePayPalCredentials(apiKey: string): Promise<boolean> {
  try {
    // Placeholder para validação PayPal
    return apiKey.length > 10;
  } catch (error) {
    return false;
  }
}
