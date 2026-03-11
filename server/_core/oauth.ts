import type { Express, Request, Response } from "express";
import * as db from "../infra/db.js";
import { generateToken } from "../services/auth.service.js";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // OAuth callback is now handled by JWT authentication
  // This route is kept for backward compatibility but redirects to login
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    try {
      // Redirect to login page
      // OAuth flow is now handled through JWT login endpoint
      res.redirect(302, "/login");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
