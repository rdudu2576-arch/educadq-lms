import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { appRouter, createContext } from "./_core";
import { loginRateLimiter, registerRateLimiter, apiRateLimiter } from "./middleware/loginRateLimiter";

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
    const { createLesson } = await import("./infra/db");
    
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
      const { enrollStudent, updatePayment } = await import("./infra/db");
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
