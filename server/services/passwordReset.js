import crypto from "crypto";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var RESET_TOKEN_EXPIRY = "1h";
var resetTokens = new Map();
/**
 * Gera um token de reset de senha
 */
export function generatePasswordResetToken(userId, email) {
    var payload = {
        userId: userId,
        email: email,
        type: "password-reset",
    };
    var token = jwt.sign(payload, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });
    var expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    var resetToken = {
        token: token,
        userId: userId,
        email: email,
        expiresAt: expiresAt,
    };
    resetTokens.set(token, resetToken);
    var resetUrl = "".concat(process.env.FRONTEND_URL || "http://localhost:3000", "/reset-password?token=").concat(token);
    return {
        token: token,
        resetUrl: resetUrl,
        expiresAt: expiresAt,
    };
}
/**
 * Verifica um token de reset de senha
 */
export function verifyPasswordResetToken(token) {
    try {
        var resetToken = resetTokens.get(token);
        if (!resetToken) {
            return {
                isValid: false,
                message: "Token de reset inválido ou expirado",
            };
        }
        if (resetToken.usedAt) {
            return {
                isValid: false,
                message: "Este token de reset já foi utilizado",
            };
        }
        if (new Date() > resetToken.expiresAt) {
            resetTokens.delete(token);
            return {
                isValid: false,
                message: "Token de reset expirado",
            };
        }
        var payload = jwt.verify(token, JWT_SECRET);
        if (payload.type !== "password-reset") {
            return {
                isValid: false,
                message: "Token inválido",
            };
        }
        return {
            isValid: true,
            userId: payload.userId,
            email: payload.email,
            message: "Token válido",
        };
    }
    catch (error) {
        return {
            isValid: false,
            message: "Erro ao verificar token",
        };
    }
}
/**
 * Marca um token de reset como utilizado
 */
export function markResetTokenAsUsed(token) {
    var resetToken = resetTokens.get(token);
    if (resetToken) {
        resetToken.usedAt = new Date();
        return true;
    }
    return false;
}
/**
 * Limpa tokens de reset expirados
 */
export function cleanupExpiredResetTokens() {
    var now = new Date();
    var count = 0;
    resetTokens.forEach(function (token, key) {
        if (token.expiresAt < now) {
            resetTokens.delete(key);
            count++;
        }
    });
    return count;
}
/**
 * Obtém informações de um token de reset
 */
export function getResetTokenInfo(token) {
    return resetTokens.get(token);
}
/**
 * Gera um código de confirmação por email
 */
export function generateEmailConfirmationCode(email) {
    var code = crypto.randomBytes(3).toString("hex").toUpperCase();
    var expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    return {
        code: code,
        expiresAt: expiresAt,
    };
}
/**
 * Gera um link seguro para reset de senha com hash
 */
export function generateSecureResetLink(userId, email, baseUrl) {
    if (baseUrl === void 0) { baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"; }
    var token = generatePasswordResetToken(userId, email).token;
    return "".concat(baseUrl, "/reset-password?token=").concat(encodeURIComponent(token));
}
