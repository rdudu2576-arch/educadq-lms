import { PaymentRetryEngine } from "../domain/payments/retryEngine";
import * as db from "../infra/db";

/**
 * Job que processa retries de pagamento
 * Deve ser executado a cada 5 minutos
 */
export async function processPaymentRetries(): Promise<void> {
  try {
    console.log("[Retry Job] Starting payment retry processing...");

    // Buscar todas as tentativas pendentes
    const pendingRetries = await PaymentRetryEngine.getPendingRetries();

    if (pendingRetries.length === 0) {
      console.log("[Retry Job] No pending retries found");
      return;
    }

    console.log(`[Retry Job] Found ${pendingRetries.length} pending retries`);

    // Processar cada retry
    let successCount = 0;
    let failureCount = 0;

    for (const retry of pendingRetries) {
      try {
        const success = await PaymentRetryEngine.processRetry(retry.id);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`[Retry Job] Error processing retry ${retry.id}:`, error);
        failureCount++;
      }
    }

    console.log(
      `[Retry Job] Completed: ${successCount} successful, ${failureCount} failed`
    );
  } catch (error) {
    console.error("[Retry Job] Fatal error:", error);
  }
}

/**
 * Job que atualiza métricas de retry
 * Deve ser executado diariamente
 */
export async function updateRetryMetrics(): Promise<void> {
  try {
    console.log("[Metrics Job] Updating retry metrics...");

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Buscar estatísticas do dia
    // const stats = await db.getRetryStatsForDate(today);

    // Atualizar ou criar métrica
    // await db.upsertRetryMetrics({
    //   date: today,
    //   totalRetries: stats.total,
    //   successfulRetries: stats.successful,
    //   failedRetries: stats.failed,
    //   abandonedRetries: stats.abandoned,
    //   totalAmountRecovered: stats.totalAmount,
    //   averageRetryCount: stats.averageRetries,
    // });

    console.log("[Metrics Job] Metrics updated successfully");
  } catch (error) {
    console.error("[Metrics Job] Error updating metrics:", error);
  }
}

/**
 * Job que limpa retries antigos
 * Deve ser executado semanalmente
 */
export async function cleanupOldRetries(): Promise<void> {
  try {
    console.log("[Cleanup Job] Cleaning up old retries...");

    // Deletar retries com mais de 90 dias
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // await db.deletePaymentRetriesBefore(ninetyDaysAgo);

    console.log("[Cleanup Job] Cleanup completed");
  } catch (error) {
    console.error("[Cleanup Job] Error during cleanup:", error);
  }
}

/**
 * Configurar jobs com node-schedule ou similar
 */
export function setupRetryJobs(): void {
  // Importar schedule library
  // const schedule = require("node-schedule");

  // Processar retries a cada 5 minutos
  // schedule.scheduleJob("*/5 * * * *", () => {
  //   processPaymentRetries().catch(console.error);
  // });

  // Atualizar métricas diariamente às 00:00
  // schedule.scheduleJob("0 0 * * *", () => {
  //   updateRetryMetrics().catch(console.error);
  // });

  // Limpar retries antigos toda segunda-feira às 02:00
  // schedule.scheduleJob("0 2 * * 1", () => {
  //   cleanupOldRetries().catch(console.error);
  // });

  console.log("[Jobs] Retry jobs configured");
}
