import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../infra/schema.pg.js";
import { verifyFirebaseToken, getUserById } from "../services/auth.service.js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // 1. Get token from cookies
    let token = opts.req.cookies?.token;

    // 2. Or from Authorization header (Bearer token)
    if (!token && opts.req.headers.authorization) {
      const authHeader = opts.req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      // Verify Firebase ID Token
      const payload = await verifyFirebaseToken(token);

      if (payload) {
        // Get user from database
        const dbUser = await getUserById(payload.id);
        if (dbUser) {
          user = dbUser;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures
    console.error("[Auth] Context creation error:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
