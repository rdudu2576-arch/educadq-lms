import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { appRouter, createContext } from "./_core/index.js";
import {
  loginRateLimiter,
  registerRateLimiter,
  apiRateLimiter,
} from "./middleware/loginRateLimiter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());

app.use("/api/trpc", apiRateLimiter);

app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/lessons", async (req, res) => {
  try {
    const { moduleId, title, type, content, videoUrl, liveUrl, order } = req.body;

    if (!moduleId || !title) {
      return res.status(400).json({
        error: "moduleId and title are required",
      });
    }

    const { createLesson } = await import("./infra/db.js");

    const lesson = await createLesson({
      moduleId,
      title,
      type: type ?? "text",
      content,
      videoUrl,
      liveUrl,
      order: order ?? 1,
    });

    res.json(lesson);
  } catch (error) {
    console.error("[API] lesson creation error:", error);
    res.status(500).json({ error: "internal_error" });
  }
});

app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const payment = req.body;

    if (payment?.status === "approved") {
      const { enrollStudent, updatePayment } = await import("./infra/db.js");

      if (payment.user_id && payment.course_id) {
        await enrollStudent(payment.user_id, payment.course_id);
      }

      if (payment.payment_id) {
        await updatePayment(payment.payment_id, {
          status: "paid",
          paidAt: new Date(),
        });
      }

      console.log(
        `[Webhook] course ${payment.course_id} released for user ${payment.user_id}`
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[Webhook] mercadopago error:", error);
    res.sendStatus(500);
  }
});

const distPath = path.resolve(__dirname, "..", "dist", "public");

if (fs.existsSync(distPath)) {
  console.log("[Static] serving:", distPath);

  app.use(
    express.static(distPath, {
      maxAge: "1d",
    })
  );
}

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error("[tRPC]", path, error);
    },
  })
);

const indexFile = path.join(distPath, "index.html");

app.get("*", (req, res) => {
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }

  res.status(404).send("Build not found. Run npm run build.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
  console.log(`PORT: ${PORT}`);
  console.log(`API: /api/trpc`);
});
// Deploy trigger 1773452001
