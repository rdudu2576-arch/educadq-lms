import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { appRouter, createContext } from "./_core/index.js";
import { loginRateLimiter, registerRateLimiter, apiRateLimiter } from "./middleware/loginRateLimiter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser()); // Parse cookies
app.use(cors());

// Rate limiters
app.use("/api/trpc/auth.login", loginRateLimiter);
app.use("/api/trpc/auth.register", registerRateLimiter);
app.use("/api/trpc", apiRateLimiter);

// REST API for lesson creation (workaround for tRPC form issue)
app.post("/api/lessons", async (req, res) => {
  try {
    const { moduleId, title, type, content, videoUrl, liveUrl, order } = req.body;
    const { createLesson } = await import("./infra/db.js");
    
    if (!moduleId || !title) {
      return res.status(400).json({ error: "moduleId and title are required" });
    }
    
    const lesson = await createLesson({
      moduleId,
      title,
      type: type || "text",
      content,
      videoUrl,
      liveUrl,
      order: order || 1,
    });
    
    res.json(lesson);
  } catch (error: any) {
    console.error("[REST API] Erro ao criar aula:", error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook Mercado Pago - rota direta Express
app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const payment = req.body;
    if (payment?.status === "approved" && payment?.user_id && payment?.course_id) {
      const { enrollStudent, updatePayment } = await import("./infra/db.js");
      await enrollStudent(payment.user_id, payment.course_id);
      if (payment.payment_id) {
        await updatePayment(payment.payment_id, { status: "paid", paidAt: new Date() });
      }
      console.log(`[Webhook] Curso ${payment.course_id} liberado para usuario ${payment.user_id}`);
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("[Webhook] Erro ao processar pagamento:", error);
    res.sendStatus(500);
  }
});

// Servir arquivos estáticos do frontend (dist/public) ANTES da API
const distPublicPath = path.resolve(__dirname, "..", "dist", "public");

if (fs.existsSync(distPublicPath)) {
  console.log(`[Static] Serving static files from: ${distPublicPath}`);
  app.use(express.static(distPublicPath, { maxAge: "1d" }));
} else {
  console.warn(`[Static] Build directory not found at ${distPublicPath}`);
  console.warn("[Static] Please run: npm run build");
}

// tRPC API
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`[tRPC] Error in ${path}:`, error);
    },
  }),
);

// SPA fallback - servir index.html para rotas não encontradas
const indexPath = path.resolve(distPublicPath, "index.html");
app.get("*", (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Build files not found. Please run: npm run build");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  console.log(`[Server] Frontend: http://localhost:${PORT}`);
  console.log(`[Server] API: http://localhost:${PORT}/api/trpc`);
});
