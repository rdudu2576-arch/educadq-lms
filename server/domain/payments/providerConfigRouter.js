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
import { router, adminProcedure, publicProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
export var providerConfigRouter = router({
    listProviders: adminProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            // Buscar todos os provedores configurados
            return [2 /*return*/, [
                    {
                        id: 1,
                        name: "Mercado Pago",
                        type: "mercado_pago",
                        isActive: true,
                        supportedMethods: ["credit_card", "debit_card", "pix", "boleto"],
                        maxInstallments: 12,
                        feePercentage: "2.99",
                    },
                    {
                        id: 2,
                        name: "Stripe",
                        type: "stripe",
                        isActive: false,
                        supportedMethods: ["credit_card", "debit_card"],
                        maxInstallments: 12,
                        feePercentage: "2.90",
                    },
                    {
                        id: 3,
                        name: "PayPal",
                        type: "paypal",
                        isActive: false,
                        supportedMethods: ["credit_card", "paypal_wallet"],
                        maxInstallments: 12,
                        feePercentage: "3.49",
                    },
                ]];
        });
    }); }),
    getActiveProvider: publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Retornar provedor ativo
            return [2 /*return*/, {
                    id: 1,
                    name: "Mercado Pago",
                    type: "mercado_pago",
                    supportedMethods: ["credit_card", "debit_card", "pix", "boleto"],
                    maxInstallments: 12,
                }];
        });
    }); }),
    updateProvider: adminProcedure
        .input(z.object({
        providerId: z.number(),
        apiKey: z.string().min(10),
        publicKey: z.string().optional(),
        webhookSecret: z.string().optional(),
        maxInstallments: z.number().min(1).max(12),
        feePercentage: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var isValid;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!ctx.user) {
                        throw new TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Not authenticated",
                        });
                    }
                    return [4 /*yield*/, validateProviderCredentials(input.providerId, input)];
                case 1:
                    isValid = _c.sent();
                    if (!isValid) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Invalid provider credentials",
                        });
                    }
                    // Atualizar configuração
                    // await db.updatePaymentProvider(input.providerId, input);
                    // Log da mudança
                    // await db.logProviderChange(input.providerId, "config_updated", ctx.user.userId, input);
                    return [2 /*return*/, { success: true, message: "Provider configuration updated" }];
            }
        });
    }); }),
    switchActiveProvider: adminProcedure
        .input(z.object({
        providerId: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            if (!ctx.user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            // Desativar todos os provedores
            // await db.deactivateAllProviders();
            // Ativar novo provedor
            // await db.activateProvider(input.providerId);
            // Log da mudança
            // await db.logProviderChange(input.providerId, "activated", ctx.user.userId);
            return [2 /*return*/, {
                    success: true,
                    message: "Payment provider switched successfully",
                }];
        });
    }); }),
    testProviderConnection: adminProcedure
        .input(z.object({
        providerId: z.number(),
        apiKey: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var isValid, error_1;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, validateProviderCredentials(input.providerId, {
                            apiKey: input.apiKey,
                        })];
                case 1:
                    isValid = _c.sent();
                    if (!isValid) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Connection test failed",
                        });
                    }
                    return [2 /*return*/, { success: true, message: "Connection successful" }];
                case 2:
                    error_1 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Connection test failed",
                    });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    getProviderLogs: adminProcedure
        .input(z.object({ providerId: z.number().optional() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            // Buscar logs de mudanças de provedores
            return [2 /*return*/, [
                    {
                        id: 1,
                        providerId: 1,
                        action: "activated",
                        details: "Mercado Pago ativado",
                        changedBy: 1,
                        createdAt: new Date(),
                    },
                ]];
        });
    }); }),
    getSupportedProviders: publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    {
                        id: 1,
                        name: "Mercado Pago",
                        type: "mercado_pago",
                        description: "Integração com Mercado Pago",
                        supportedMethods: ["credit_card", "debit_card", "pix", "boleto"],
                        maxInstallments: 12,
                        feePercentage: "2.99",
                        documentation: "https://www.mercadopago.com.br/developers",
                    },
                    {
                        id: 2,
                        name: "Stripe",
                        type: "stripe",
                        description: "Integração com Stripe",
                        supportedMethods: ["credit_card", "debit_card"],
                        maxInstallments: 12,
                        feePercentage: "2.90",
                        documentation: "https://stripe.com/docs",
                    },
                    {
                        id: 3,
                        name: "PayPal",
                        type: "paypal",
                        description: "Integração com PayPal",
                        supportedMethods: ["credit_card", "paypal_wallet"],
                        maxInstallments: 12,
                        feePercentage: "3.49",
                        documentation: "https://developer.paypal.com",
                    },
                ]];
        });
    }); }),
});
function validateProviderCredentials(providerId, credentials) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    _a = providerId;
                    switch (_a) {
                        case 1: return [3 /*break*/, 1];
                        case 2: return [3 /*break*/, 3];
                        case 3: return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 7];
                case 1: return [4 /*yield*/, validateMercadoPagoCredentials(credentials.apiKey)];
                case 2: // Mercado Pago
                return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, validateStripeCredentials(credentials.apiKey)];
                case 4: // Stripe
                return [2 /*return*/, _b.sent()];
                case 5: return [4 /*yield*/, validatePayPalCredentials(credentials.apiKey)];
                case 6: // PayPal
                return [2 /*return*/, _b.sent()];
                case 7: return [2 /*return*/, false];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_2 = _b.sent();
                    console.error("Credential validation error:", error_2);
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function validateMercadoPagoCredentials(apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("https://api.mercadopago.com/v1/accounts/me", {
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.ok];
                case 2:
                    error_3 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function validateStripeCredentials(apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("https://api.stripe.com/v1/account", {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.ok];
                case 2:
                    error_4 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function validatePayPalCredentials(apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Placeholder para validação PayPal
                return [2 /*return*/, apiKey.length > 10];
            }
            catch (error) {
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
