/**
 * Security Logger Service
 * Registra eventos de segurança para auditoria
 */

export enum SecurityEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGIN_RATE_LIMIT = "LOGIN_RATE_LIMIT",
  REGISTRATION_SUCCESS = "REGISTRATION_SUCCESS",
  REGISTRATION_FAILURE = "REGISTRATION_FAILURE",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PASSWORD_RESET = "PASSWORD_RESET",
  LOGOUT = "LOGOUT",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  TOKEN_INVALID = "TOKEN_INVALID",
  CSRF_FAILURE = "CSRF_FAILURE",
}

export interface SecurityLog {
  timestamp: Date;
  eventType: SecurityEventType;
  userId?: number;
  email?: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: "info" | "warning" | "error" | "critical";
}

const logs: SecurityLog[] = [];
const MAX_LOGS = 10000;

/**
 * Registra um evento de segurança
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  ip: string,
  options: {
    userId?: number;
    email?: string;
    userAgent?: string;
    details?: Record<string, any>;
    severity?: "info" | "warning" | "error" | "critical";
  } = {}
): SecurityLog {
  const log: SecurityLog = {
    timestamp: new Date(),
    eventType,
    ip,
    userId: options.userId,
    email: options.email,
    userAgent: options.userAgent,
    details: options.details,
    severity: options.severity || "info",
  };

  logs.push(log);

  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  if (log.severity === "critical" || log.severity === "error") {
    console.error(`[SECURITY] ${eventType}:`, {
      email: log.email,
      ip: log.ip,
      details: log.details,
      timestamp: log.timestamp.toISOString(),
    });
  } else if (log.severity === "warning") {
    console.warn(`[SECURITY] ${eventType}:`, {
      email: log.email,
      ip: log.ip,
      timestamp: log.timestamp.toISOString(),
    });
  }

  return log;
}

/**
 * Obtém logs de segurança com filtros opcionais
 */
export function getSecurityLogs(options: {
  eventType?: SecurityEventType;
  userId?: number;
  email?: string;
  ip?: string;
  severity?: "info" | "warning" | "error" | "critical";
  limit?: number;
  offset?: number;
} = {}): SecurityLog[] {
  let filtered = logs;

  if (options.eventType) {
    filtered = filtered.filter((log) => log.eventType === options.eventType);
  }

  if (options.userId) {
    filtered = filtered.filter((log) => log.userId === options.userId);
  }

  if (options.email) {
    filtered = filtered.filter((log) => log.email === options.email);
  }

  if (options.ip) {
    filtered = filtered.filter((log) => log.ip === options.ip);
  }

  if (options.severity) {
    filtered = filtered.filter((log) => log.severity === options.severity);
  }

  filtered = filtered.reverse();

  const offset = options.offset || 0;
  const limit = options.limit || 100;

  return filtered.slice(offset, offset + limit);
}

/**
 * Detecta atividades suspeitas
 */
export function detectSuspiciousActivity(ip: string, timeWindowMs: number = 15 * 60 * 1000): {
  failedLoginAttempts: number;
  isSuspicious: boolean;
  reason?: string;
} {
  const now = Date.now();
  const recentLogs = logs.filter(
    (log) =>
      log.ip === ip &&
      log.timestamp.getTime() > now - timeWindowMs &&
      log.eventType === SecurityEventType.LOGIN_FAILURE
  );

  const failedAttempts = recentLogs.length;
  const isSuspicious = failedAttempts >= 5;

  return {
    failedLoginAttempts: failedAttempts,
    isSuspicious,
    reason: isSuspicious ? `${failedAttempts} tentativas de login falhadas nos últimos 15 minutos` : undefined,
  };
}

/**
 * Limpa logs antigos
 */
export function clearOldLogs(daysOld: number = 30): number {
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  const initialLength = logs.length;

  logs.splice(
    0,
    logs.findIndex((log) => log.timestamp.getTime() > cutoffTime)
  );

  return initialLength - logs.length;
}

/**
 * Obtém estatísticas de segurança
 */
export function getSecurityStats(timeWindowHours: number = 24): {
  totalEvents: number;
  loginSuccesses: number;
  loginFailures: number;
  registrations: number;
  suspiciousActivities: number;
  topIPs: Array<{ ip: string; count: number }>;
} {
  const cutoffTime = Date.now() - timeWindowHours * 60 * 60 * 1000;
  const recentLogs = logs.filter((log) => log.timestamp.getTime() > cutoffTime);

  const ipCounts: Record<string, number> = {};
  recentLogs.forEach((log) => {
    ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
  });

  const topIPs = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEvents: recentLogs.length,
    loginSuccesses: recentLogs.filter((log) => log.eventType === SecurityEventType.LOGIN_SUCCESS).length,
    loginFailures: recentLogs.filter((log) => log.eventType === SecurityEventType.LOGIN_FAILURE).length,
    registrations: recentLogs.filter((log) => log.eventType === SecurityEventType.REGISTRATION_SUCCESS).length,
    suspiciousActivities: recentLogs.filter((log) => log.eventType === SecurityEventType.SUSPICIOUS_ACTIVITY).length,
    topIPs,
  };
}
