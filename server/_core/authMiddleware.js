import { extractTokenFromCookie, verifyToken } from "./jwt.js";
export function authMiddleware(req, res, next) {
    try {
        var token = extractTokenFromCookie(req.headers.cookie);
        if (!token) {
            req.user = undefined;
            return next();
        }
        var payload = verifyToken(token);
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        req.user = undefined;
        next();
    }
}
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}
export function requireRole() {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (req, res, next) {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}
