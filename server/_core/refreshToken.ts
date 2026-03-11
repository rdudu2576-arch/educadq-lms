import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface RefreshTokenPayload {
  userId: number;
  email: string;
  role: "admin" | "professor" | "student";
  type: "refresh";
  iat?: number;
  exp?: number;
}

export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: "admin" | "professor" | "student";
  type: "access";
  iat?: number;
  exp?: number;
}

export function generateAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp" | "type">): string {
  return jwt.sign(
    { ...payload, type: "access" },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, "iat" | "exp" | "type">): string {
  return jwt.sign(
    { ...payload, type: "refresh" },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export function generateTokenPair(payload: Omit<AccessTokenPayload, "iat" | "exp" | "type">) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }
    return payload;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired access token",
    });
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return payload;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired refresh token",
    });
  }
}

export function setAccessTokenCookie(res: any, token: string): void {
  res.setHeader(
    "Set-Cookie",
    `access_token=${token}; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=${15 * 60}`
  );
}

export function setRefreshTokenCookie(res: any, token: string): void {
  res.setHeader(
    "Set-Cookie",
    `refresh_token=${token}; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
}

export function clearTokenCookies(res: any): void {
  res.setHeader(
    "Set-Cookie",
    [
      "access_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0",
      "refresh_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0",
    ]
  );
}

export function extractAccessTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("access_token=")) {
      return cookie.substring("access_token=".length);
    }
  }
  return null;
}

export function extractRefreshTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("refresh_token=")) {
      return cookie.substring("refresh_token=".length);
    }
  }
  return null;
}
