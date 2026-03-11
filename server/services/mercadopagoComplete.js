/**
 * MercadoPago Complete Payment Service
 * Integração completa com todas as opções de pagamento do MercadoPago
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
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
var client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});
/**
 * Cria uma preferência de pagamento com TODAS as opções do MercadoPago
 * - Cartão de crédito/débito
 * - PIX
 * - Boleto
 * - Transferência bancária
 * - Parcelamento
 * - Wallet do MercadoPago
 */
export function createMercadoPagoCheckout(params) {
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
                                // Itens do pedido
                                items: [
                                    {
                                        id: params.courseId.toString(),
                                        title: params.courseName,
                                        quantity: 1,
                                        unit_price: params.coursePrice,
                                        currency_id: "BRL",
                                        description: "Acesso ao curso ".concat(params.courseName),
                                    },
                                ],
                                // Dados do pagador
                                payer: {
                                    email: params.studentEmail,
                                    name: params.studentName,
                                    phone: {
                                        area_code: "11",
                                        number: "0000000000",
                                    },
                                    address: {
                                        zip_code: "00000000",
                                        street_name: "Rua",
                                        street_number: "0",
                                    },
                                },
                                // URLs de retorno
                                back_urls: {
                                    success: params.successUrl,
                                    failure: params.cancelUrl,
                                    pending: params.cancelUrl,
                                },
                                // Configurações de pagamento
                                auto_return: "approved",
                                binary_mode: false, // Permite múltiplas tentativas
                                notification_url: "".concat(process.env.BACKEND_URL || "http://localhost:3000", "/api/webhooks/mercadopago"),
                                // Referência externa
                                external_reference: params.courseId.toString(),
                                // Metadados
                                metadata: {
                                    courseId: params.courseId,
                                    studentEmail: params.studentEmail,
                                    studentName: params.studentName,
                                },
                            },
                        })];
                case 1:
                    result = _a.sent();
                    if (result.init_point) {
                        console.log("[MercadoPago] Preferência criada com sucesso:", result.id);
                        return [2 /*return*/, result.init_point];
                    }
                    return [2 /*return*/, null];
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
 * Cria um pagamento direto com cartão de crédito
 */
export function createCardPayment(courseId_1, courseName_1, amount_1, cardToken_1, payerEmail_1, payerName_1) {
    return __awaiter(this, arguments, void 0, function (courseId, courseName, amount, cardToken, payerEmail, payerName, installments) {
        var payment, result, error_2;
        if (installments === void 0) { installments = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                        return [2 /*return*/, {
                                success: false,
                                error: "MercadoPago não configurado",
                            }];
                    }
                    payment = new Payment(client);
                    return [4 /*yield*/, payment.create({
                            body: {
                                transaction_amount: amount,
                                token: cardToken,
                                installments: installments,
                                payment_method_id: "credit_card",
                                payer: {
                                    email: payerEmail,
                                    first_name: payerName.split(" ")[0],
                                    last_name: payerName.split(" ").slice(1).join(" ") || ".",
                                },
                                description: courseName,
                                external_reference: courseId.toString(),
                            },
                        })];
                case 1:
                    result = _a.sent();
                    if (result.id) {
                        console.log("[MercadoPago] Pagamento com cartão criado:", result.id);
                        return [2 /*return*/, {
                                success: true,
                                paymentId: result.id.toString(),
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: "Erro ao processar pagamento",
                        }];
                case 2:
                    error_2 = _a.sent();
                    console.error("[MercadoPago] Erro ao processar pagamento com cartão:", error_2);
                    return [2 /*return*/, {
                            success: false,
                            error: error_2.message || "Erro ao processar pagamento",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cria um pagamento com PIX
 */
export function createPixPayment(courseId, courseName, amount, payerEmail, payerName) {
    return __awaiter(this, void 0, void 0, function () {
        var payment, result, qrCode, copyPaste, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                        return [2 /*return*/, {
                                success: false,
                                error: "MercadoPago não configurado",
                            }];
                    }
                    payment = new Payment(client);
                    return [4 /*yield*/, payment.create({
                            body: {
                                transaction_amount: amount,
                                payment_method_id: "pix",
                                payer: {
                                    email: payerEmail,
                                    first_name: payerName.split(" ")[0],
                                    last_name: payerName.split(" ").slice(1).join(" ") || ".",
                                },
                                description: courseName,
                                external_reference: courseId.toString(),
                            },
                        })];
                case 1:
                    result = _b.sent();
                    if ((_a = result.point_of_interaction) === null || _a === void 0 ? void 0 : _a.transaction_data) {
                        qrCode = result.point_of_interaction.transaction_data.qr_code;
                        copyPaste = result.point_of_interaction.transaction_data.qr_code;
                        console.log("[MercadoPago] Pagamento PIX criado:", result.id);
                        return [2 /*return*/, {
                                success: true,
                                qrCode: qrCode,
                                copyPaste: copyPaste,
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: "Erro ao gerar QR Code PIX",
                        }];
                case 2:
                    error_3 = _b.sent();
                    console.error("[MercadoPago] Erro ao criar pagamento PIX:", error_3);
                    return [2 /*return*/, {
                            success: false,
                            error: error_3.message || "Erro ao criar pagamento PIX",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cria um pagamento com Boleto
 */
export function createBoletoPayment(courseId, courseName, amount, payerEmail, payerName) {
    return __awaiter(this, void 0, void 0, function () {
        var payment, result, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                        return [2 /*return*/, {
                                success: false,
                                error: "MercadoPago não configurado",
                            }];
                    }
                    payment = new Payment(client);
                    return [4 /*yield*/, payment.create({
                            body: {
                                transaction_amount: amount,
                                payment_method_id: "bolbradesco",
                                payer: {
                                    email: payerEmail,
                                    first_name: payerName.split(" ")[0],
                                    last_name: payerName.split(" ").slice(1).join(" ") || ".",
                                },
                                description: courseName,
                                external_reference: courseId.toString(),
                            },
                        })];
                case 1:
                    result = _b.sent();
                    if ((_a = result.transaction_details) === null || _a === void 0 ? void 0 : _a.external_resource_url) {
                        console.log("[MercadoPago] Boleto criado:", result.id);
                        return [2 /*return*/, {
                                success: true,
                                boletoUrl: result.transaction_details.external_resource_url,
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: "Erro ao gerar boleto",
                        }];
                case 2:
                    error_4 = _b.sent();
                    console.error("[MercadoPago] Erro ao criar boleto:", error_4);
                    return [2 /*return*/, {
                            success: false,
                            error: error_4.message || "Erro ao criar boleto",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cria um pagamento com Transferência Bancária
 */
export function createTransferPayment(courseId, courseName, amount, payerEmail, payerName) {
    return __awaiter(this, void 0, void 0, function () {
        var payment, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                        return [2 /*return*/, {
                                success: false,
                                error: "MercadoPago não configurado",
                            }];
                    }
                    payment = new Payment(client);
                    return [4 /*yield*/, payment.create({
                            body: {
                                transaction_amount: amount,
                                payment_method_id: "bank_transfer",
                                payer: {
                                    email: payerEmail,
                                    first_name: payerName.split(" ")[0],
                                    last_name: payerName.split(" ").slice(1).join(" ") || ".",
                                },
                                description: courseName,
                                external_reference: courseId.toString(),
                            },
                        })];
                case 1:
                    result = _a.sent();
                    if (result.id) {
                        console.log("[MercadoPago] Transferência bancária criada:", result.id);
                        return [2 /*return*/, {
                                success: true,
                                bankInfo: {
                                    paymentId: result.id,
                                    status: result.status,
                                    amount: result.transaction_amount,
                                },
                            }];
                    }
                    return [2 /*return*/, {
                            success: false,
                            error: "Erro ao criar transferência bancária",
                        }];
                case 2:
                    error_5 = _a.sent();
                    console.error("[MercadoPago] Erro ao criar transferência:", error_5);
                    return [2 /*return*/, {
                            success: false,
                            error: error_5.message || "Erro ao criar transferência",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Obtém o status de um pagamento
 */
export function getPaymentStatus(paymentId) {
    return __awaiter(this, void 0, void 0, function () {
        var payment, result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
                        return [2 /*return*/, null];
                    }
                    payment = new Payment(client);
                    return [4 /*yield*/, payment.get({ id: paymentId })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, {
                            id: result.id,
                            status: result.status,
                            amount: result.transaction_amount,
                            paymentMethod: result.payment_method_id,
                            createdAt: result.date_created,
                        }];
                case 2:
                    error_6 = _a.sent();
                    console.error("[MercadoPago] Erro ao obter status:", error_6);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Processa webhook do MercadoPago
 */
export function processMercadoPagoWebhook(data) {
    return __awaiter(this, void 0, void 0, function () {
        var paymentId, status_1, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log("[MercadoPago Webhook] Evento recebido:", data);
                    if (!(data.type === "payment")) return [3 /*break*/, 2];
                    paymentId = data.data.id;
                    return [4 /*yield*/, getPaymentStatus(paymentId)];
                case 1:
                    status_1 = _a.sent();
                    if ((status_1 === null || status_1 === void 0 ? void 0 : status_1.status) === "approved") {
                        console.log("[MercadoPago Webhook] Pagamento aprovado:", paymentId);
                        // Implementar lógica de aprovação
                    }
                    else if ((status_1 === null || status_1 === void 0 ? void 0 : status_1.status) === "pending") {
                        console.log("[MercadoPago Webhook] Pagamento pendente:", paymentId);
                        // Implementar lógica de pendência
                    }
                    else if ((status_1 === null || status_1 === void 0 ? void 0 : status_1.status) === "rejected") {
                        console.log("[MercadoPago Webhook] Pagamento rejeitado:", paymentId);
                        // Implementar lógica de rejeição
                    }
                    _a.label = 2;
                case 2: return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error("[MercadoPago Webhook] Erro ao processar webhook:", error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
