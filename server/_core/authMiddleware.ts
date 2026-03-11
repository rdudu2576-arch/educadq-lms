import { NextFunction, Request, Response } from "express";
import { extractTokenFromCookie, verifyToken } from "./jwt.js";
import { TRPCError } from "@trpc/server";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: "admin" | "professor" | "user";
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
      id: payload.id,
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
