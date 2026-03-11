import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "7d";

export interface JWTPayload {
  id: number;
  email: string;
  role: "admin" | "professor" | "user";
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

export function extractTokenFromCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("auth_token=")) {
      return cookie.substring("auth_token=".length);
    }
  }
  return null;
}

export function setAuthCookie(
  res: any,
  token: string,
  secure: boolean = true
): void {
  res.setHeader(
    "Set-Cookie",
    `auth_token=${token}; HttpOnly; Secure=${secure}; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
}

export function clearAuthCookie(res: any): void {
  res.setHeader(
    "Set-Cookie",
    "auth_token=; HttpOnly; Secure=true; SameSite=Strict; Path=/; Max-Age=0"
  );
}
