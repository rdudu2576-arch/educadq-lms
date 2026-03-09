import { v4 as uuidv4 } from "uuid";

export interface LoginSession {
  sessionId: string;
  userId: number;
  email: string;
  ip: string;
  userAgent: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };
  loginTime: Date;
  lastActivityTime: Date;
  isActive: boolean;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

const sessions: Map<string, LoginSession> = new Map();
const userSessions: Map<number, string[]> = new Map();

/**
 * Cria uma nova sessão de login
 */
export function createLoginSession(
  userId: number,
  email: string,
  ip: string,
  userAgent: string
): LoginSession {
  const sessionId = uuidv4();
  const deviceInfo = parseUserAgent(userAgent);

  const session: LoginSession = {
    sessionId,
    userId,
    email,
    ip,
    userAgent,
    deviceInfo,
    loginTime: new Date(),
    lastActivityTime: new Date(),
    isActive: true,
  };

  sessions.set(sessionId, session);

  if (!userSessions.has(userId)) {
    userSessions.set(userId, []);
  }
  userSessions.get(userId)!.push(sessionId);

  return session;
}

/**
 * Obtém uma sessão por ID
 */
export function getSession(sessionId: string): LoginSession | undefined {
  return sessions.get(sessionId);
}

/**
 * Obtém todas as sessões de um usuário
 */
export function getUserSessions(userId: number): LoginSession[] {
  const sessionIds = userSessions.get(userId) || [];
  return sessionIds
    .map((id) => sessions.get(id))
    .filter((session): session is LoginSession => session !== undefined);
}

/**
 * Atualiza a atividade de uma sessão
 */
export function updateSessionActivity(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (session) {
    session.lastActivityTime = new Date();
    return true;
  }
  return false;
}

/**
 * Encerra uma sessão
 */
export function endSession(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (session) {
    session.isActive = false;
    return true;
  }
  return false;
}

/**
 * Encerra todas as sessões de um usuário
 */
export function endAllUserSessions(userId: number): number {
  const sessionIds = userSessions.get(userId) || [];
  let count = 0;

  sessionIds.forEach((sessionId) => {
    if (endSession(sessionId)) {
      count++;
    }
  });

  return count;
}

/**
 * Detecta sessões suspeitas
 */
export function detectSuspiciousSessions(userId: number): {
  isSuspicious: boolean;
  activeSessions: LoginSession[];
  differentIPs: string[];
} {
  const userSessions = getUserSessions(userId).filter((s) => s.isActive);
  const ips = new Set(userSessions.map((s) => s.ip));

  return {
    isSuspicious: ips.size > 1,
    activeSessions: userSessions,
    differentIPs: Array.from(ips),
  };
}

/**
 * Limpa sessões expiradas
 */
export function cleanupExpiredSessions(maxInactivityDays: number = 7): number {
  const cutoffTime = Date.now() - maxInactivityDays * 24 * 60 * 60 * 1000;
  let count = 0;

  sessions.forEach((session, sessionId) => {
    if (session.lastActivityTime.getTime() < cutoffTime) {
      sessions.delete(sessionId);
      count++;
    }
  });

  return count;
}

/**
 * Obtém estatísticas de sessão
 */
export function getSessionStats(): {
  totalActiveSessions: number;
  totalUsers: number;
  averageSessionDuration: number;
  topIPs: Array<{ ip: string; count: number }>;
} {
  const activeSessions = Array.from(sessions.values()).filter((s) => s.isActive);
  const uniqueUsers = new Set(activeSessions.map((s) => s.userId));

  const ipCounts: Record<string, number> = {};
  activeSessions.forEach((session) => {
    ipCounts[session.ip] = (ipCounts[session.ip] || 0) + 1;
  });

  const topIPs = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgDuration =
    activeSessions.length > 0
      ? activeSessions.reduce(
          (sum, s) => sum + (s.lastActivityTime.getTime() - s.loginTime.getTime()),
          0
        ) / activeSessions.length
      : 0;

  return {
    totalActiveSessions: activeSessions.length,
    totalUsers: uniqueUsers.size,
    averageSessionDuration: Math.round(avgDuration / 1000 / 60),
    topIPs,
  };
}

/**
 * Analisa User-Agent para extrair informações do dispositivo
 */
function parseUserAgent(userAgent: string): {
  browser?: string;
  os?: string;
  device?: string;
} {
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/);
  const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);

  return {
    browser: browserMatch ? browserMatch[1] : undefined,
    os: osMatch ? osMatch[1] : undefined,
    device: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
  };
}
