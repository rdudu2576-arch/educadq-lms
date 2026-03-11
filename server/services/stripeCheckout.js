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
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
/**
 * Cria uma sessão de checkout no Stripe
 */
export function createCheckoutSession(params) {
    return __awaiter(this, void 0, void 0, function () {
        var session, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.checkout.sessions.create({
                            payment_method_types: ["card"],
                            line_items: [
                                {
                                    price_data: {
                                        currency: "brl",
                                        product_data: {
                                            name: params.courseName,
                                            description: "Acesso ao curso: ".concat(params.courseName),
                                        },
                                        unit_amount: Math.round(params.coursePrice * 100), // Converter para centavos
                                    },
                                    quantity: 1,
                                },
                            ],
                            mode: "payment",
                            customer_email: params.userEmail,
                            client_reference_id: params.userId.toString(),
                            metadata: {
                                userId: params.userId.toString(),
                                courseId: params.courseId.toString(),
                                userName: params.userName,
                            },
                            success_url: params.successUrl,
                            cancel_url: params.cancelUrl,
                            allow_promotion_codes: true,
                        })];
                case 1:
                    session = _a.sent();
                    return [2 /*return*/, session.url];
                case 2:
                    error_1 = _a.sent();
                    console.error("[Stripe] Erro ao criar sessão de checkout:", error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Recupera informações de uma sessão de checkout
 */
export function getCheckoutSession(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.checkout.sessions.retrieve(sessionId)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    console.error("[Stripe] Erro ao recuperar sessão:", error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cria ou obtém um cliente Stripe
 */
export function getOrCreateStripeCustomer(email, name, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var customers, customer, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, stripe.customers.list({
                            email: email,
                            limit: 1,
                        })];
                case 1:
                    customers = _a.sent();
                    if (customers.data.length > 0) {
                        return [2 /*return*/, customers.data[0].id];
                    }
                    return [4 /*yield*/, stripe.customers.create({
                            email: email,
                            name: name,
                            metadata: {
                                userId: userId.toString(),
                            },
                        })];
                case 2:
                    customer = _a.sent();
                    return [2 /*return*/, customer.id];
                case 3:
                    error_3 = _a.sent();
                    console.error("[Stripe] Erro ao criar/obter cliente:", error_3);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Recupera o histórico de pagamentos de um cliente
 */
export function getCustomerPayments(customerId) {
    return __awaiter(this, void 0, void 0, function () {
        var paymentIntents, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.paymentIntents.list({
                            customer: customerId,
                            limit: 100,
                        })];
                case 1:
                    paymentIntents = _a.sent();
                    return [2 /*return*/, paymentIntents.data];
                case 2:
                    error_4 = _a.sent();
                    console.error("[Stripe] Erro ao recuperar pagamentos:", error_4);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Obtém detalhes de um pagamento
 */
export function getPaymentDetails(paymentIntentId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.paymentIntents.retrieve(paymentIntentId)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_5 = _a.sent();
                    console.error("[Stripe] Erro ao recuperar detalhes do pagamento:", error_5);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Reembolsa um pagamento
 */
export function refundPayment(paymentIntentId, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var refund, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, stripe.refunds.create({
                            payment_intent: paymentIntentId,
                            amount: amount,
                        })];
                case 1:
                    refund = _a.sent();
                    return [2 /*return*/, refund];
                case 2:
                    error_6 = _a.sent();
                    console.error("[Stripe] Erro ao reembolsar pagamento:", error_6);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
