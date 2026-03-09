import { NextFunction, Request, Response } from "express";
import { extractTokenFromCookie, verifyToken } from "./jwt";
import { TRPCError } from "@trpc/server";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "admin" | "professor" | "student";
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractTokenFromCookie(req.headers.cookie);

    if (!token) {
      req.user = undefined;
      return next();
    }

    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
