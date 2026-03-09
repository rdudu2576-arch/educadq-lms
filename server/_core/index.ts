import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { loginRateLimiter, registerRateLimiter, apiRateLimiter } from "../middleware/loginRateLimiter";
import { startWebSocket } from "../websocket";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy for rate limiting
  app.set('trust proxy', 1);

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser()); // Parse cookies
  app.use("/api/trpc/auth.login", loginRateLimiter); // Rate limit login
  app.use("/api/trpc/auth.register", registerRateLimiter); // Rate limit register
  app.use("/api/trpc", apiRateLimiter); // Rate limit general API

  // REST API for lesson creation (workaround for tRPC form issue)
  app.post("/api/lessons", async (req, res) => {
    try {
      const { moduleId, title, type, content, videoUrl, liveUrl, order } = req.body;
      const { createLesson } = await import("../infra/db");
      
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
        const { enrollStudent, updatePayment } = await import("../infra/db");
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
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Iniciar WebSocket para monitoramento em tempo real
  startWebSocket(server);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
