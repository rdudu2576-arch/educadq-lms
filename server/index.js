var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { appRouter, createContext } from "./_core/index.js";
import { apiRateLimiter, } from "./middleware/loginRateLimiter.js";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());
app.use("/api/trpc", apiRateLimiter);
app.get("/health", function (_, res) {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.post("/api/lessons", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, moduleId, title, type, content, videoUrl, liveUrl, order, createLesson, lesson, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, moduleId = _a.moduleId, title = _a.title, type = _a.type, content = _a.content, videoUrl = _a.videoUrl, liveUrl = _a.liveUrl, order = _a.order;
                if (!moduleId || !title) {
                    return [2 /*return*/, res.status(400).json({
                            error: "moduleId and title are required",
                        })];
                }
                return [4 /*yield*/, import("./infra/db.js")];
            case 1:
                createLesson = (_b.sent()).createLesson;
                return [4 /*yield*/, createLesson({
                        moduleId: moduleId,
                        title: title,
                        type: type !== null && type !== void 0 ? type : "text",
                        content: content,
                        videoUrl: videoUrl,
                        liveUrl: liveUrl,
                        order: order !== null && order !== void 0 ? order : 1,
                    })];
            case 2:
                lesson = _b.sent();
                res.json(lesson);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error("[API] lesson creation error:", error_1);
                res.status(500).json({ error: "internal_error" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/webhook/mercadopago", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payment, _a, enrollStudent, updatePayment, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                payment = req.body;
                if (!((payment === null || payment === void 0 ? void 0 : payment.status) === "approved")) return [3 /*break*/, 6];
                return [4 /*yield*/, import("./infra/db.js")];
            case 1:
                _a = _b.sent(), enrollStudent = _a.enrollStudent, updatePayment = _a.updatePayment;
                if (!(payment.user_id && payment.course_id)) return [3 /*break*/, 3];
                return [4 /*yield*/, enrollStudent(payment.user_id, payment.course_id)];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                if (!payment.payment_id) return [3 /*break*/, 5];
                return [4 /*yield*/, updatePayment(payment.payment_id, {
                        status: "paid",
                        paidAt: new Date(),
                    })];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                console.log("[Webhook] course ".concat(payment.course_id, " released for user ").concat(payment.user_id));
                _b.label = 6;
            case 6:
                res.sendStatus(200);
                return [3 /*break*/, 8];
            case 7:
                error_2 = _b.sent();
                console.error("[Webhook] mercadopago error:", error_2);
                res.sendStatus(500);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
var distPath = path.resolve(__dirname, "..", "dist", "public");
if (fs.existsSync(distPath)) {
    console.log("[Static] serving:", distPath);
    app.use(express.static(distPath, {
        maxAge: "1d",
    }));
}
app.use("/api/trpc", trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createContext,
    onError: function (_a) {
        var error = _a.error, path = _a.path;
        console.error("[tRPC]", path, error);
    },
}));
var indexFile = path.join(distPath, "index.html");
app.get("*", function (req, res) {
    if (fs.existsSync(indexFile)) {
        return res.sendFile(indexFile);
    }
    res.status(404).send("Build not found. Run npm run build.");
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server running");
    console.log("PORT: ".concat(PORT));
    console.log("API: /api/trpc");
});
