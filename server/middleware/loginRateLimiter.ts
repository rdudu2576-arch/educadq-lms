import rateLimit from "express-rate-limit";

/**
 * Rate limiter para proteção contra força bruta no login
 * - Máximo 5 tentativas por IP a cada 15 minutos
 * - Máximo 20 tentativas por IP a cada 1 hora
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true, // Retorna informações de rate limit nos headers
  legacyHeaders: false, // Desabilita headers X-RateLimit-*
  skip: (req) => {
    // Não aplicar rate limit a IPs específicos (ex: localhost em desenvolvimento)
    return req.ip === "127.0.0.1" || req.ip === "::1";
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
 * - Máximo 20 tentativas por IP a cada 1 hora
 */
export const strictLoginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 tentativas por IP por hora
  message: "Muitas tentativas de login. Acesso bloqueado por 1 hora.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1";
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
 * - Máximo 3 registros por IP a cada 1 hora
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por IP
  message: "Muitas tentativas de registro. Tente novamente em 1 hora.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1";
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
 * - Máximo 100 requisições por IP a cada 15 minutos
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: "Muitas requisições. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.ip === "127.0.0.1" || req.ip === "::1";
  },
});
