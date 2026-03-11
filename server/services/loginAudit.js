import { v4 as uuidv4 } from "uuid";
var sessions = new Map();
var userSessions = new Map();
/**
 * Cria uma nova sessão de login
 */
export function createLoginSession(userId, email, ip, userAgent) {
    var sessionId = uuidv4();
    var deviceInfo = parseUserAgent(userAgent);
    var session = {
        sessionId: sessionId,
        userId: userId,
        email: email,
        ip: ip,
        userAgent: userAgent,
        deviceInfo: deviceInfo,
        loginTime: new Date(),
        lastActivityTime: new Date(),
        isActive: true,
    };
    sessions.set(sessionId, session);
    if (!userSessions.has(userId)) {
        userSessions.set(userId, []);
    }
    userSessions.get(userId).push(sessionId);
    return session;
}
/**
 * Obtém uma sessão por ID
 */
export function getSession(sessionId) {
    return sessions.get(sessionId);
}
/**
 * Obtém todas as sessões de um usuário
 */
export function getUserSessions(userId) {
    var sessionIds = userSessions.get(userId) || [];
    return sessionIds
        .map(function (id) { return sessions.get(id); })
        .filter(function (session) { return session !== undefined; });
}
/**
 * Atualiza a atividade de uma sessão
 */
export function updateSessionActivity(sessionId) {
    var session = sessions.get(sessionId);
    if (session) {
        session.lastActivityTime = new Date();
        return true;
    }
    return false;
}
/**
 * Encerra uma sessão
 */
export function endSession(sessionId) {
    var session = sessions.get(sessionId);
    if (session) {
        session.isActive = false;
        return true;
    }
    return false;
}
/**
 * Encerra todas as sessões de um usuário
 */
export function endAllUserSessions(userId) {
    var sessionIds = userSessions.get(userId) || [];
    var count = 0;
    sessionIds.forEach(function (sessionId) {
        if (endSession(sessionId)) {
            count++;
        }
    });
    return count;
}
/**
 * Detecta sessões suspeitas
 */
export function detectSuspiciousSessions(userId) {
    var userSessions = getUserSessions(userId).filter(function (s) { return s.isActive; });
    var ips = new Set(userSessions.map(function (s) { return s.ip; }));
    return {
        isSuspicious: ips.size > 1,
        activeSessions: userSessions,
        differentIPs: Array.from(ips),
    };
}
/**
 * Limpa sessões expiradas
 */
export function cleanupExpiredSessions(maxInactivityDays) {
    if (maxInactivityDays === void 0) { maxInactivityDays = 7; }
    var cutoffTime = Date.now() - maxInactivityDays * 24 * 60 * 60 * 1000;
    var count = 0;
    sessions.forEach(function (session, sessionId) {
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
export function getSessionStats() {
    var activeSessions = Array.from(sessions.values()).filter(function (s) { return s.isActive; });
    var uniqueUsers = new Set(activeSessions.map(function (s) { return s.userId; }));
    var ipCounts = {};
    activeSessions.forEach(function (session) {
        ipCounts[session.ip] = (ipCounts[session.ip] || 0) + 1;
    });
    var topIPs = Object.entries(ipCounts)
        .map(function (_a) {
        var ip = _a[0], count = _a[1];
        return ({ ip: ip, count: count });
    })
        .sort(function (a, b) { return b.count - a.count; })
        .slice(0, 10);
    var avgDuration = activeSessions.length > 0
        ? activeSessions.reduce(function (sum, s) { return sum + (s.lastActivityTime.getTime() - s.loginTime.getTime()); }, 0) / activeSessions.length
        : 0;
    return {
        totalActiveSessions: activeSessions.length,
        totalUsers: uniqueUsers.size,
        averageSessionDuration: Math.round(avgDuration / 1000 / 60),
        topIPs: topIPs,
    };
}
/**
 * Analisa User-Agent para extrair informações do dispositivo
 */
function parseUserAgent(userAgent) {
    var browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/);
    var osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);
    return {
        browser: browserMatch ? browserMatch[1] : undefined,
        os: osMatch ? osMatch[1] : undefined,
        device: userAgent.includes("Mobile") ? "Mobile" : "Desktop",
    };
}
