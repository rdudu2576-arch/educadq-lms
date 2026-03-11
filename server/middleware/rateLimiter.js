/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and abuse
 */
var store = {};
/**
 * Create rate limiter middleware
 */
export function createRateLimiter(options) {
    if (options === void 0) { options = {}; }
    var windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    var maxAttempts = options.maxAttempts || 5;
    var keyGenerator = options.keyGenerator || (function (req) { return req.ip || "unknown"; });
    return function (req, res, next) {
        var key = keyGenerator(req);
        var now = Date.now();
        // Clean up expired entries
        if (store[key] && store[key].resetTime < now) {
            delete store[key];
        }
        // Initialize or increment attempts
        if (!store[key]) {
            store[key] = {
                attempts: 1,
                resetTime: now + windowMs,
            };
        }
        else {
            store[key].attempts++;
        }
        // Set headers
        res.setHeader("RateLimit-Limit", maxAttempts);
        res.setHeader("RateLimit-Remaining", Math.max(0, maxAttempts - store[key].attempts));
        res.setHeader("RateLimit-Reset", Math.ceil(store[key].resetTime / 1000));
        // Check if limit exceeded
        if (store[key].attempts > maxAttempts) {
            res.status(429).json({
                error: "Too many requests",
                retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
            });
            return;
        }
        next();
    };
}
/**
 * Login rate limiter (stricter)
 */
export function createLoginRateLimiter() {
    return createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxAttempts: 5, // 5 attempts
        keyGenerator: function (req) { var _a; return "login:".concat(((_a = req.body) === null || _a === void 0 ? void 0 : _a.email) || req.ip); },
    });
}
/**
 * API rate limiter (general)
 */
export function createApiRateLimiter() {
    return createRateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxAttempts: 100, // 100 requests per minute
        keyGenerator: function (req) { return "api:".concat(req.ip); },
    });
}
/**
 * Payment rate limiter (very strict)
 */
export function createPaymentRateLimiter() {
    return createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxAttempts: 10, // 10 payment attempts per hour
        keyGenerator: function (req) { var _a; return "payment:".concat(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip); },
    });
}
/**
 * Check if IP/user is rate limited
 */
export function isRateLimited(key) {
    var entry = store[key];
    if (!entry)
        return false;
    var now = Date.now();
    if (entry.resetTime < now) {
        delete store[key];
        return false;
    }
    return true;
}
/**
 * Get rate limit info
 */
export function getRateLimitInfo(key) {
    var entry = store[key];
    if (!entry)
        return null;
    var now = Date.now();
    if (entry.resetTime < now) {
        delete store[key];
        return null;
    }
    return {
        attempts: entry.attempts,
        resetTime: entry.resetTime,
        remainingTime: entry.resetTime - now,
    };
}
/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key) {
    delete store[key];
}
/**
 * Clear all rate limits
 */
export function clearAllRateLimits() {
    Object.keys(store).forEach(function (key) {
        delete store[key];
    });
}
