import csrf from "csurf";
import cookieParser from "cookie-parser";
import { Express } from "express";

/**
 * CSRF Protection Middleware
 * Protege contra ataques Cross-Site Request Forgery
 */

// Configurar CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

/**
 * Middleware para gerar e validar tokens CSRF
 */
export function setupCSRFProtection(app: Express) {
  // Usar cookie parser antes de CSRF
  app.use(cookieParser());

  // Aplicar CSRF protection a todas as rotas
  app.use(csrfProtection);

  // Rota para obter token CSRF
  app.get("/api/csrf-token", (req: any, res: any) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // Middleware para adicionar token CSRF aos headers de resposta
  app.use((req: any, res: any, next: any) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  // Tratador de erro CSRF
  app.use((err: any, req: any, res: any, next: any) => {
    if (err.code === "EBADCSRFTOKEN") {
      res.status(403).json({
        error: {
          code: "CSRF_TOKEN_INVALID",
          message: "Token CSRF inválido ou expirado",
        },
      });
    } else {
      next(err);
    }
  });
}

export { csrfProtection };
