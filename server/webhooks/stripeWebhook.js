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
import Stripe from "stripe";
import { getDb } from "../infra/db.js";
import { payments } from "../infra/schema.pg.js";
import { eq, and } from "drizzle-orm";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
var WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
/**
 * Processa eventos do webhook do Stripe
 */
export function handleStripeWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var sig, event, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sig = req.headers["stripe-signature"];
                    try {
                        event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
                    }
                    catch (err) {
                        console.error("[Stripe Webhook] Erro ao verificar assinatura:", err.message);
                        res.status(400).send("Webhook Error: ".concat(err.message));
                        return [2 /*return*/];
                    }
                    // Detectar eventos de teste
                    if (event.id.startsWith("evt_test_")) {
                        console.log("[Stripe Webhook] Evento de teste detectado:", event.type);
                        res.json({ verified: true });
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 12, , 13]);
                    _a = event.type;
                    switch (_a) {
                        case "checkout.session.completed": return [3 /*break*/, 2];
                        case "payment_intent.succeeded": return [3 /*break*/, 4];
                        case "payment_intent.payment_failed": return [3 /*break*/, 6];
                        case "customer.subscription.deleted": return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 2: return [4 /*yield*/, handleCheckoutSessionCompleted(event.data.object)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 4: return [4 /*yield*/, handlePaymentIntentSucceeded(event.data.object)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 6: return [4 /*yield*/, handlePaymentIntentFailed(event.data.object)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 8: return [4 /*yield*/, handleSubscriptionDeleted(event.data.object)];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 10:
                    console.log("[Stripe Webhook] Evento n\u00E3o tratado: ".concat(event.type));
                    _b.label = 11;
                case 11:
                    res.json({ received: true });
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _b.sent();
                    console.error("[Stripe Webhook] Erro ao processar evento:", error_1);
                    res.status(500).json({ error: "Erro ao processar webhook" });
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Processa checkout.session.completed
 */
function handleCheckoutSessionCompleted(session) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, courseId, db, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("[Stripe Webhook] Checkout concluído:", session.id);
                    userId = parseInt(session.client_reference_id || "0");
                    courseId = parseInt(((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.courseId) || "0");
                    if (!userId || !courseId) {
                        console.error("[Stripe Webhook] Dados inválidos no metadata");
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getDb()];
                case 2:
                    db = _c.sent();
                    if (!db) {
                        console.error("[Stripe Webhook] Erro ao conectar ao banco de dados");
                        return [2 /*return*/];
                    }
                    // Atualizar pagamento como pago
                    return [4 /*yield*/, db
                            .update(payments)
                            .set({
                            status: "paid",
                            transactionId: (_b = session.payment_intent) === null || _b === void 0 ? void 0 : _b.toString(),
                            paidAt: new Date(),
                        })
                            .where(and(eq(payments.studentId, userId), eq(payments.courseId, courseId)))];
                case 3:
                    // Atualizar pagamento como pago
                    _c.sent();
                    console.log("[Stripe Webhook] Pagamento processado para aluno ".concat(userId));
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _c.sent();
                    console.error("[Stripe Webhook] Erro ao processar checkout concluído:", error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Processa payment_intent.succeeded
 */
function handlePaymentIntentSucceeded(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var db, userId, courseId, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("[Stripe Webhook] Pagamento bem-sucedido:", paymentIntent.id);
                    if (!((_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.userId) || !((_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.courseId)) {
                        console.error("[Stripe Webhook] Metadata inválida no payment intent");
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getDb()];
                case 2:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/];
                    userId = parseInt(paymentIntent.metadata.userId);
                    courseId = parseInt(paymentIntent.metadata.courseId);
                    // Atualizar pagamento
                    return [4 /*yield*/, db
                            .update(payments)
                            .set({
                            status: "paid",
                            transactionId: paymentIntent.id,
                            paidAt: new Date(),
                        })
                            .where(and(eq(payments.studentId, userId), eq(payments.courseId, courseId)))];
                case 3:
                    // Atualizar pagamento
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _c.sent();
                    console.error("[Stripe Webhook] Erro ao processar payment succeeded:", error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Processa payment_intent.payment_failed
 */
function handlePaymentIntentFailed(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var db, userId, courseId, error_4;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("[Stripe Webhook] Pagamento falhou:", paymentIntent.id);
                    if (!((_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.userId) || !((_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.courseId)) {
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getDb()];
                case 2:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/];
                    userId = parseInt(paymentIntent.metadata.userId);
                    courseId = parseInt(paymentIntent.metadata.courseId);
                    // Atualizar pagamento como pendente
                    return [4 /*yield*/, db
                            .update(payments)
                            .set({
                            status: "pending",
                            transactionId: paymentIntent.id,
                        })
                            .where(and(eq(payments.studentId, userId), eq(payments.courseId, courseId)))];
                case 3:
                    // Atualizar pagamento como pendente
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _c.sent();
                    console.error("[Stripe Webhook] Erro ao processar payment failed:", error_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Processa customer.subscription.deleted
 */
function handleSubscriptionDeleted(subscription) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("[Stripe Webhook] Subscrição cancelada:", subscription.id);
            return [2 /*return*/];
        });
    });
}
