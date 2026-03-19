import rateLimit from "express-rate-limit";

/**
 * Rate limiter para proteção contra força bruta no login
 * - Máximo 20 tentativas por IP a cada 15 minutos
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 tentativas por IP (aumentado para evitar bloqueios falsos)
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1" || process.env.NODE_ENV !== "production";
  },
  handler: (req: any, res: any) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
        retryAfter: req.rateLimit?.resetTime,
      },
    });
  },
});

/**
 * Rate limiter mais restritivo para proteção contra ataques distribuídos
 */
export const strictLoginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 tentativas por IP por hora
  message: "Muitas tentativas de login. Acesso bloqueado por 1 hora.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1" || process.env.NODE_ENV !== "production";
  },
  handler: (req: any, res: any) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Acesso bloqueado temporariamente. Tente novamente em 1 hora.",
        retryAfter: req.rateLimit?.resetTime,
      },
    });
  },
});

/**
 * Rate limiter para registro de novos usuários
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 registros por IP por hora
  message: "Muitas tentativas de registro. Tente novamente em 1 hora.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1" || process.env.NODE_ENV !== "production";
  },
  handler: (req: any, res: any) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Muitas tentativas de registro. Tente novamente em 1 hora.",
        retryAfter: req.rateLimit?.resetTime,
      },
    });
  },
});

/**
 * Rate limiter geral para API
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requisições por IP
  message: "Muitas requisições. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1" || process.env.NODE_ENV !== "production";
  },
});
