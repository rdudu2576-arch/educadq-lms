import { Request } from "express";

/**
 * Session Protection Middleware
 * Anti-sharing protection (Netflix-style)
 * Uses in-memory session tracking (can be upgraded to Redis)
 */

interface SessionInfo {
  userId: number;
  ipAddress: string;
  deviceHash: string;
  userAgent: string;
  createdAt: Date;
  isActive: boolean;
}

// In-memory session store (use Redis in production)
const activeSessions = new Map<number, SessionInfo[]>();

export function generateDeviceHash(userAgent?: string): string {
  if (!userAgent) return "unknown";
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

export async function checkSessionSuspicion(
  userId: number,
  currentIp: string,
  currentDeviceHash: string
): Promise<{ isSuspicious: boolean; reason?: string; activeSessions: number }> {
  const sessions = activeSessions.get(userId) || [];
  const active = sessions.filter(s => s.isActive);

  if (active.length === 0) return { isSuspicious: false, activeSessions: 0 };

  const ips = new Set(active.map(s => s.ipAddress));
  if (ips.size > 1 && !ips.has(currentIp)) {
    return { isSuspicious: true, reason: "Multiple IPs detected", activeSessions: active.length };
  }

  const devices = new Set(active.map(s => s.deviceHash));
  if (devices.size > 1 && !devices.has(currentDeviceHash)) {
    return { isSuspicious: true, reason: "Multiple devices detected", activeSessions: active.length };
  }

  return { isSuspicious: false, activeSessions: active.length };
}

export async function createProtectedSession(
  userId: number,
  req: Request
): Promise<{ sessionCreated: boolean; isSuspicious: boolean; reason?: string }> {
  const clientIp = getClientIp(req);
  const deviceHash = generateDeviceHash(req.headers["user-agent"]);
  const userAgent = req.headers["user-agent"] || "";

  const suspicion = await checkSessionSuspicion(userId, clientIp, deviceHash);

  if (suspicion.isSuspicious) {
    console.warn(`[Security] Suspicious login for user ${userId}: ${suspicion.reason}`);
    // Deactivate all other sessions
    const sessions = activeSessions.get(userId) || [];
    sessions.forEach(s => { s.isActive = false; });
  }

  const sessions = activeSessions.get(userId) || [];
  sessions.push({
    userId, ipAddress: clientIp, deviceHash, userAgent: userAgent as string,
    createdAt: new Date(), isActive: true,
  });
  activeSessions.set(userId, sessions);

  return { sessionCreated: true, isSuspicious: suspicion.isSuspicious, reason: suspicion.reason };
}

export async function validateSession(
  userId: number,
  req: Request
): Promise<{ isValid: boolean; reason?: string }> {
  const sessions = activeSessions.get(userId) || [];
  const active = sessions.filter(s => s.isActive);

  if (active.length === 0) return { isValid: false, reason: "No active sessions" };

  const clientIp = getClientIp(req);
  const deviceHash = generateDeviceHash(req.headers["user-agent"]);

  const valid = active.some(s => s.ipAddress === clientIp || s.deviceHash === deviceHash);
  if (!valid) return { isValid: false, reason: "Session IP/device mismatch" };

  return { isValid: true };
}
