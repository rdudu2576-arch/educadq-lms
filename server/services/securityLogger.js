/**
 * Security Logger Service
 * Registra eventos de segurança para auditoria
 */
export var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["LOGIN_SUCCESS"] = "LOGIN_SUCCESS";
    SecurityEventType["LOGIN_FAILURE"] = "LOGIN_FAILURE";
    SecurityEventType["LOGIN_RATE_LIMIT"] = "LOGIN_RATE_LIMIT";
    SecurityEventType["REGISTRATION_SUCCESS"] = "REGISTRATION_SUCCESS";
    SecurityEventType["REGISTRATION_FAILURE"] = "REGISTRATION_FAILURE";
    SecurityEventType["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    SecurityEventType["PASSWORD_RESET"] = "PASSWORD_RESET";
    SecurityEventType["LOGOUT"] = "LOGOUT";
    SecurityEventType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    SecurityEventType["TOKEN_REFRESH"] = "TOKEN_REFRESH";
    SecurityEventType["TOKEN_INVALID"] = "TOKEN_INVALID";
    SecurityEventType["CSRF_FAILURE"] = "CSRF_FAILURE";
})(SecurityEventType || (SecurityEventType = {}));
var logs = [];
var MAX_LOGS = 10000;
/**
 * Registra um evento de segurança
 */
export function logSecurityEvent(eventType, ip, options) {
    if (options === void 0) { options = {}; }
    var log = {
        timestamp: new Date(),
        eventType: eventType,
        ip: ip,
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
        console.error("[SECURITY] ".concat(eventType, ":"), {
            email: log.email,
            ip: log.ip,
            details: log.details,
            timestamp: log.timestamp.toISOString(),
        });
    }
    else if (log.severity === "warning") {
        console.warn("[SECURITY] ".concat(eventType, ":"), {
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
export function getSecurityLogs(options) {
    if (options === void 0) { options = {}; }
    var filtered = logs;
    if (options.eventType) {
        filtered = filtered.filter(function (log) { return log.eventType === options.eventType; });
    }
    if (options.userId) {
        filtered = filtered.filter(function (log) { return log.userId === options.userId; });
    }
    if (options.email) {
        filtered = filtered.filter(function (log) { return log.email === options.email; });
    }
    if (options.ip) {
        filtered = filtered.filter(function (log) { return log.ip === options.ip; });
    }
    if (options.severity) {
        filtered = filtered.filter(function (log) { return log.severity === options.severity; });
    }
    filtered = filtered.reverse();
    var offset = options.offset || 0;
    var limit = options.limit || 100;
    return filtered.slice(offset, offset + limit);
}
/**
 * Detecta atividades suspeitas
 */
export function detectSuspiciousActivity(ip, timeWindowMs) {
    if (timeWindowMs === void 0) { timeWindowMs = 15 * 60 * 1000; }
    var now = Date.now();
    var recentLogs = logs.filter(function (log) {
        return log.ip === ip &&
            log.timestamp.getTime() > now - timeWindowMs &&
            log.eventType === SecurityEventType.LOGIN_FAILURE;
    });
    var failedAttempts = recentLogs.length;
    var isSuspicious = failedAttempts >= 5;
    return {
        failedLoginAttempts: failedAttempts,
        isSuspicious: isSuspicious,
        reason: isSuspicious ? "".concat(failedAttempts, " tentativas de login falhadas nos \u00FAltimos 15 minutos") : undefined,
    };
}
/**
 * Limpa logs antigos
 */
export function clearOldLogs(daysOld) {
    if (daysOld === void 0) { daysOld = 30; }
    var cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    var initialLength = logs.length;
    logs.splice(0, logs.findIndex(function (log) { return log.timestamp.getTime() > cutoffTime; }));
    return initialLength - logs.length;
}
/**
 * Obtém estatísticas de segurança
 */
export function getSecurityStats(timeWindowHours) {
    if (timeWindowHours === void 0) { timeWindowHours = 24; }
    var cutoffTime = Date.now() - timeWindowHours * 60 * 60 * 1000;
    var recentLogs = logs.filter(function (log) { return log.timestamp.getTime() > cutoffTime; });
    var ipCounts = {};
    recentLogs.forEach(function (log) {
        ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
    });
    var topIPs = Object.entries(ipCounts)
        .map(function (_a) {
        var ip = _a[0], count = _a[1];
        return ({ ip: ip, count: count });
    })
        .sort(function (a, b) { return b.count - a.count; })
        .slice(0, 10);
    return {
        totalEvents: recentLogs.length,
        loginSuccesses: recentLogs.filter(function (log) { return log.eventType === SecurityEventType.LOGIN_SUCCESS; }).length,
        loginFailures: recentLogs.filter(function (log) { return log.eventType === SecurityEventType.LOGIN_FAILURE; }).length,
        registrations: recentLogs.filter(function (log) { return log.eventType === SecurityEventType.REGISTRATION_SUCCESS; }).length,
        suspiciousActivities: recentLogs.filter(function (log) { return log.eventType === SecurityEventType.SUSPICIOUS_ACTIVITY; }).length,
        topIPs: topIPs,
    };
}
