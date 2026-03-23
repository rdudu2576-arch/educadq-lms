import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../infra/schema.pg.js";
import { verifyToken, getUserById } from "../services/auth.service.js";

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
    let token = opts.req.cookies?.token;

    if (!token && opts.req.headers.authorization) {
      const authHeader = opts.req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      // Se for o token de bypass (apenas para ambiente de desenvolvimento ou emergência)
      if (token === "firebase-token-used") {
         return { req: opts.req, res: opts.res, user: null };
      }

      // Verify JWT Token
      const payload = await verifyToken(token);

      if (payload && typeof payload === 'object' && 'id' in payload) {
        // Get user from database
        const dbUser = await getUserById(payload.id as number);
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
