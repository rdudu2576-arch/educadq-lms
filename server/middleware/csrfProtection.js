import csrf from "csurf";
import cookieParser from "cookie-parser";
/**
 * CSRF Protection Middleware
 * Protege contra ataques Cross-Site Request Forgery
 */
// Configurar CSRF protection
var csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    },
});
/**
 * Middleware para gerar e validar tokens CSRF
 */
export function setupCSRFProtection(app) {
    // Usar cookie parser antes de CSRF
    app.use(cookieParser());
    // Aplicar CSRF protection a todas as rotas
    app.use(csrfProtection);
    // Rota para obter token CSRF
    app.get("/api/csrf-token", function (req, res) {
        res.json({ csrfToken: req.csrfToken() });
    });
    // Middleware para adicionar token CSRF aos headers de resposta
    app.use(function (req, res, next) {
        res.locals.csrfToken = req.csrfToken();
        next();
    });
    // Tratador de erro CSRF
    app.use(function (err, req, res, next) {
        if (err.code === "EBADCSRFTOKEN") {
            res.status(403).json({
                error: {
                    code: "CSRF_TOKEN_INVALID",
                    message: "Token CSRF inválido ou expirado",
                },
            });
        }
        else {
            next(err);
        }
    });
}
export { csrfProtection };
