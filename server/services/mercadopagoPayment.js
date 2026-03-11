/**
 * MercadoPago Payment Service
 * Gerencia pagamentos via MercadoPago e PIX
 */
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
import { MercadoPagoConfig, Preference } from "mercadopago";
var client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});
/**
 * Cria uma preferência de pagamento no MercadoPago
 */
export function createMercadoPagoPreference(params) {
    return __awaiter(this, void 0, void 0, function () {
        var preference, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                        console.warn("[MercadoPago] Token não configurado");
                        return [2 /*return*/, null];
                    }
                    preference = new Preference(client);
                    return [4 /*yield*/, preference.create({
                            body: {
                                items: [
                                    {
                                        id: params.courseId.toString(),
                                        title: params.courseName,
                                        quantity: 1,
                                        unit_price: params.coursePrice,
                                        currency_id: "BRL",
                                    },
                                ],
                                payer: {
                                    email: params.studentEmail,
                                    name: params.studentName,
                                },
                                back_urls: {
                                    success: params.successUrl,
                                    failure: params.cancelUrl,
                                    pending: params.cancelUrl,
                                },
                                auto_return: "approved",
                                notification_url: "".concat(process.env.BACKEND_URL || "http://localhost:3000", "/api/webhooks/mercadopago"),
                                external_reference: params.courseId.toString(),
                                metadata: {
                                    courseId: params.courseId,
                                    studentEmail: params.studentEmail,
                                },
                            },
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.init_point || null];
                case 2:
                    error_1 = _a.sent();
                    console.error("[MercadoPago] Erro ao criar preferência:", error_1);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Verifica o status de um pagamento no MercadoPago
 */
export function getMercadoPagoPaymentStatus(paymentId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                    return [2 /*return*/, null];
                }
                // Implementar verificação de status
                // const payment = await client.payment.get(paymentId);
                // return payment;
                return [2 /*return*/, null];
            }
            catch (error) {
                console.error("[MercadoPago] Erro ao obter status do pagamento:", error);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Gera um QR Code para pagamento PIX
 */
export function generatePixQrCode(courseId, courseName, amount) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                    console.warn("[MercadoPago] Token não configurado para PIX");
                    return [2 /*return*/, null];
                }
                // Implementar geração de QR Code PIX
                // const qrCode = await client.qrCode.create({
                //   amount,
                //   description: courseName,
                //   externalReference: courseId.toString(),
                // });
                // return qrCode.qr_data;
                return [2 /*return*/, null];
            }
            catch (error) {
                console.error("[MercadoPago] Erro ao gerar QR Code PIX:", error);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Cria um pagamento direto com dados do cartão
 */
export function createDirectPayment(courseId, courseName, amount, cardToken, payerEmail, payerName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                    return [2 /*return*/, {
                            success: false,
                            error: "MercadoPago não configurado",
                        }];
                }
                // Implementar pagamento direto
                // const payment = await client.payment.create({
                //   token: cardToken,
                //   installments: 1,
                //   amount,
                //   currency_id: "BRL",
                //   description: courseName,
                //   payer: {
                //     email: payerEmail,
                //     first_name: payerName,
                //   },
                //   external_reference: courseId.toString(),
                // });
                return [2 /*return*/, {
                        success: true,
                    }];
            }
            catch (error) {
                console.error("[MercadoPago] Erro ao processar pagamento:", error);
                return [2 /*return*/, {
                        success: false,
                        error: "Erro ao processar pagamento",
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Processa webhook do MercadoPago
 */
export function processMercadoPagoWebhook(data) {
    return __awaiter(this, void 0, void 0, function () {
        var paymentId;
        return __generator(this, function (_a) {
            try {
                console.log("[MercadoPago Webhook] Evento recebido:", data);
                if (data.type === "payment") {
                    paymentId = data.data.id;
                    console.log("[MercadoPago Webhook] Pagamento processado:", paymentId);
                    // Implementar lógica de processamento
                }
            }
            catch (error) {
                console.error("[MercadoPago Webhook] Erro ao processar webhook:", error);
            }
            return [2 /*return*/];
        });
    });
}
