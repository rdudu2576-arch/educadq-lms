import { getDb } from "../infra/db";
import { systemLogs } from "../../drizzle/schema";
import { eventBus } from "./eventBus";

export interface LogEventData {
  level: "info" | "warning" | "error" | "security";
  source: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: number;
}

export async function logEvent(data: LogEventData) {
  const log = {
    level: data.level,
    source: data.source,
    message: data.message,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    userId: data.userId || null,
    createdAt: new Date(),
  };

  try {
    const db = await getDb();
    if (!db) {
      console.error("[LOGGER] Database connection failed");
      return;
    }

    // Inserir no banco de dados
    await db.insert(systemLogs).values(log);

    // Emitir evento em tempo real
    eventBus.emit("systemLog", {
      ...log,
      id: Date.now(), // ID temporário para o frontend
      createdAt: new Date().toISOString(),
    });

    console.log(`[LOG] [${data.level.toUpperCase()}] ${data.source}: ${data.message}`);
  } catch (err) {
    console.error("[LOGGER] Error:", err);
  }
}

// Funções de conveniência
export async function logInfo(source: string, message: string, metadata?: any, userId?: number) {
  await logEvent({ level: "info", source, message, metadata, userId });
}

export async function logWarning(source: string, message: string, metadata?: any, userId?: number) {
  await logEvent({ level: "warning", source, message, metadata, userId });
}

export async function logError(source: string, message: string, metadata?: any, userId?: number) {
  await logEvent({ level: "error", source, message, metadata, userId });
}

export async function logSecurity(source: string, message: string, metadata?: any, userId?: number) {
  await logEvent({ level: "security", source, message, metadata, userId });
}
