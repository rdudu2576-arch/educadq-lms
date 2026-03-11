var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var ACCESS_TOKEN_EXPIRY = "15m";
var REFRESH_TOKEN_EXPIRY = "7d";
export function generateAccessToken(payload) {
    return jwt.sign(__assign(__assign({}, payload), { type: "access" }), JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}
export function generateRefreshToken(payload) {
    return jwt.sign(__assign(__assign({}, payload), { type: "refresh" }), JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}
export function generateTokenPair(payload) {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}
export function verifyAccessToken(token) {
    try {
        var payload = jwt.verify(token, JWT_SECRET);
        if (payload.type !== "access") {
            throw new Error("Invalid token type");
        }
        return payload;
    }
    catch (error) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired access token",
        });
    }
}
export function verifyRefreshToken(token) {
    try {
        var payload = jwt.verify(token, JWT_SECRET);
        if (payload.type !== "refresh") {
            throw new Error("Invalid token type");
        }
        return payload;
    }
    catch (error) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
        });
    }
}
export function setAccessTokenCookie(res, token) {
    res.setHeader("Set-Cookie", "access_token=".concat(token, "; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=").concat(15 * 60));
}
export function setRefreshTokenCookie(res, token) {
    res.setHeader("Set-Cookie", "refresh_token=".concat(token, "; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=").concat(7 * 24 * 60 * 60));
}
export function clearTokenCookies(res) {
    res.setHeader("Set-Cookie", [
        "access_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0",
        "refresh_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0",
    ]);
}
export function extractAccessTokenFromCookie(cookieHeader) {
    if (!cookieHeader)
        return null;
    var cookies = cookieHeader.split(";").map(function (c) { return c.trim(); });
    for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
        var cookie = cookies_1[_i];
        if (cookie.startsWith("access_token=")) {
            return cookie.substring("access_token=".length);
        }
    }
    return null;
}
export function extractRefreshTokenFromCookie(cookieHeader) {
    if (!cookieHeader)
        return null;
    var cookies = cookieHeader.split(";").map(function (c) { return c.trim(); });
    for (var _i = 0, cookies_2 = cookies; _i < cookies_2.length; _i++) {
        var cookie = cookies_2[_i];
        if (cookie.startsWith("refresh_token=")) {
            return cookie.substring("refresh_token=".length);
        }
    }
    return null;
}
