import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db";
import { PaymentProviderFactory } from "./providerFactory";
import { notifyOwner } from "../../_core/notification";

export interface RetryConfig {
  maxRetries: number;
  initialDelaySeconds: number;
  backoffMultiplier: number;
  maxDelaySeconds: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelaySeconds: 300, // 5 minutes
  backoffMultiplier: 2.0,
  maxDelaySeconds: 86400, // 24 hours
};

export class PaymentRetryEngine {
  static calculateNextRetryTime(
    retryCount: number,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Date {
    // Exponential backoff: delay = initialDelay * (backoffMultiplier ^ retryCount)
    const delay = Math.min(
      config.initialDelaySeconds * Math.pow(config.backoffMultiplier, retryCount),
      config.maxDelaySeconds
    );

    const nextRetryTime = new Date();
    nextRetryTime.setSeconds(nextRetryTime.getSeconds() + Math.floor(delay));

    return nextRetryTime;
  }

  static async createRetry(paymentId: number, error: string): Promise<number> {
    // Buscar pagamento original
    const payment = await db.getPaymentById(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    // Calcular próxima tentativa
    const nextRetryAt = this.calculateNextRetryTime(0);

    // Criar registro de retry
    // await db.createPaymentRetry({
    //   paymentId,
    //   studentId: payment.studentId,
    //   courseId: payment.courseId,
    //   amount: payment.amount,
    //   originalError: error,
    //   retryCount: 0,
    //   maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
    //   status: "pending",
    //   nextRetryAt,
    //   paymentMethod: payment.paymentMethod,
    //   installments: payment.installments,
    // });

    console.log(`[Retry] Created retry for payment ${paymentId}, next attempt at ${nextRetryAt}`);

    return paymentId;
  }

  static async processRetry(retryId: number): Promise<boolean> {
    try {
      // Buscar retry
      // const retry = await db.getPaymentRetryById(retryId);
      // if (!retry) throw new Error(`Retry ${retryId} not found`);

      // // Verificar se já atingiu máximo de tentativas
      // if (retry.retryCount >= retry.maxRetries) {
      //   await db.updatePaymentRetryStatus(retryId, "abandoned");
      //   await this.notifyAbandoned(retry);
      //   return false;
      // }

      // // Verificar se é hora de tentar novamente
      // if (new Date() < retry.nextRetryAt) {
      //   return false; // Ainda não é hora
      // }

      // // Marcar como processando
      // await db.updatePaymentRetryStatus(retryId, "processing");

      // // Tentar reprocessar pagamento
      // const provider = PaymentProviderFactory.getActiveProvider();
      // const payment = await db.getPaymentById(retry.paymentId);

      // if (!payment) throw new Error("Payment not found");

      // try {
      //   // Tentar criar pagamento novamente
      //   const paymentResult = await provider.createPayment({
      //     amount: parseFloat(retry.amount),
      //     description: `Retry - Course ${retry.courseId}`,
      //     paymentMethod: retry.paymentMethod || "credit_card",
      //     installments: retry.installments,
      //     email: payment.studentEmail,
      //   });

      //   // Atualizar com novo ID de transação
      //   await db.updatePaymentRetryStatus(retryId, "success");
      //   await db.updatePaymentStatus(retry.paymentId, "paid", {
      //     transactionId: paymentResult.id,
      //   });

      //   // Criar matrícula
      //   await db.createEnrollment({
      //     studentId: retry.studentId,
      //     courseId: retry.courseId,
      //     enrollmentDate: new Date(),
      //     status: "active",
      //   });

      //   // Notificar sucesso
      //   await this.notifySuccess(retry);

      //   return true;
      // } catch (error) {
      //   // Incrementar tentativa
      //   const nextRetryCount = retry.retryCount + 1;
      //   const nextRetryAt = this.calculateNextRetryTime(nextRetryCount);

      //   await db.updatePaymentRetry(retryId, {
      //     retryCount: nextRetryCount,
      //     lastRetryAt: new Date(),
      //     nextRetryAt,
      //     lastErrorMessage: String(error),
      //   });

      //   // Notificar falha
      //   await this.notifyRetryFailed(retry, nextRetryCount);

      //   return false;
      // }

      return false;
    } catch (error) {
      console.error(`[Retry Error] Failed to process retry ${retryId}:`, error);
      return false;
    }
  }

  static async getPendingRetries(): Promise<any[]> {
    // Buscar todas as tentativas pendentes que são hora de processar
    // const now = new Date();
    // return await db.getPaymentRetriesByStatus("pending", now);
    return [];
  }

  static async getRetryStats(days: number = 7): Promise<any> {
    // Buscar estatísticas de retries dos últimos N dias
    // return await db.getRetryMetrics(days);
    return {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      abandonedRetries: 0,
      successRate: 0,
      totalAmountRecovered: 0,
    };
  }

  private static async notifySuccess(retry: any): Promise<void> {
    await notifyOwner({
      title: "Pagamento Recuperado",
      content: `Pagamento de R$ ${retry.amount} foi reprocessado com sucesso após ${retry.retryCount + 1} tentativa(s).`,
    });

    // Notificar aluno
    // await db.createNotification({
    //   studentId: retry.studentId,
    //   type: "payment_success",
    //   title: "Pagamento Confirmado",
    //   message: `Seu pagamento foi confirmado. Você agora tem acesso ao curso.`,
    // });
  }

  private static async notifyRetryFailed(retry: any, nextRetryCount: number): Promise<void> {
    if (nextRetryCount >= retry.maxRetries) {
      await this.notifyAbandoned(retry);
      return;
    }

    const nextRetryTime = this.calculateNextRetryTime(nextRetryCount);
    const hoursUntilRetry = Math.round(
      (nextRetryTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    );

    // Notificar aluno
    // await db.createNotification({
    //   studentId: retry.studentId,
    //   type: "payment_retry",
    //   title: "Pagamento Pendente",
    //   message: `Sua tentativa de pagamento falhou. Tentaremos novamente em ${hoursUntilRetry} hora(s).`,
    // });
  }

  private static async notifyAbandoned(retry: any): Promise<void> {
    await notifyOwner({
      title: "Pagamento Abandonado",
      content: `Pagamento de R$ ${retry.amount} foi abandonado após ${retry.maxRetries} tentativas.`,
    });

    // Notificar aluno
    // await db.createNotification({
    //   studentId: retry.studentId,
    //   type: "payment_failed",
    //   title: "Pagamento Falhou",
    //   message: `Seu pagamento falhou após várias tentativas. Por favor, tente novamente ou entre em contato com o suporte.`,
    // });
  }
}
