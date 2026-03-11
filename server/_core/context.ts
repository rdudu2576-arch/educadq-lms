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
    // Get token from cookies
    const token = opts.req.cookies?.token;

    if (token) {
      // Verify JWT token
      const payload = verifyToken(token);

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
