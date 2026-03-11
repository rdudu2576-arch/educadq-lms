import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var JWT_EXPIRY = "7d";
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired token",
        });
    }
}
export function extractTokenFromCookie(cookieHeader) {
    if (!cookieHeader)
        return null;
    var cookies = cookieHeader.split(";").map(function (c) { return c.trim(); });
    for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
        var cookie = cookies_1[_i];
        if (cookie.startsWith("auth_token=")) {
            return cookie.substring("auth_token=".length);
        }
    }
    return null;
}
export function setAuthCookie(res, token, secure) {
    if (secure === void 0) { secure = true; }
    res.setHeader("Set-Cookie", "auth_token=".concat(token, "; HttpOnly; Secure=").concat(secure, "; SameSite=Strict; Path=/; Max-Age=").concat(7 * 24 * 60 * 60));
}
export function clearAuthCookie(res) {
    res.setHeader("Set-Cookie", "auth_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0");
}
