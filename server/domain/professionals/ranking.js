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
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import * as db from "../../infra/db.js";
export var rankingRouter = router({
    // Get public ranking (only users with active subscriptions)
    getPublicRanking: publicProcedure
        .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            return [2 /*return*/, db.getRanking(input.limit)];
        });
    }); }),
    // Get student's own profile
    getMyProfile: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var profile;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db.getOrCreateStudentProfile(ctx.user.id)];
                case 1:
                    profile = _c.sent();
                    return [2 /*return*/, profile];
            }
        });
    }); }),
    // Update student profile
    updateMyProfile: protectedProcedure
        .input(z.object({
        publicName: z.string().optional(),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var profile;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db.updateStudentProfile(ctx.user.id, input)];
                case 1:
                    profile = _c.sent();
                    return [2 /*return*/, profile];
            }
        });
    }); }),
    // Get student's subscription status
    getSubscriptionStatus: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var subscription, profile;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db.getActiveSubscription(ctx.user.id)];
                case 1:
                    subscription = _c.sent();
                    return [4 /*yield*/, db.getStudentProfile(ctx.user.id)];
                case 2:
                    profile = _c.sent();
                    return [2 /*return*/, {
                            hasActiveSubscription: !!subscription,
                            subscription: subscription,
                            profile: profile,
                            isPublic: (profile === null || profile === void 0 ? void 0 : profile.isPublic) || false,
                        }];
            }
        });
    }); }),
    // Get subscription history
    getSubscriptionHistory: protectedProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            return [2 /*return*/, db.getSubscriptionHistory(ctx.user.id)];
        });
    }); }),
    // Create subscription payment (R$20/year)
    createSubscription: protectedProcedure
        .input(z.object({
        method: z.enum(["pix", "credit_card", "debit_card"]),
        transactionGateway: z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var expirationDate, result;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    expirationDate = new Date();
                    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
                    return [4 /*yield*/, db.createSubscriptionPayment({
                            userId: ctx.user.id,
                            amount: "20.00",
                            status: "pending",
                            method: input.method,
                            transactionGateway: input.transactionGateway,
                            expirationDate: expirationDate,
                        })];
                case 1:
                    result = _c.sent();
                    // Log audit event
                    return [4 /*yield*/, db.createAuditLog({
                            event: "subscription_created",
                            userId: ctx.user.id,
                            description: "Subscription created via ".concat(input.method),
                            severity: "low",
                        })];
                case 2:
                    // Log audit event
                    _c.sent();
                    return [2 /*return*/, result];
            }
        });
    }); }),
    // Confirm subscription payment (webhook from payment gateway)
    confirmSubscription: protectedProcedure
        .input(z.object({
        transactionId: z.string(),
        status: z.enum(["completed", "failed"]),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var history;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db.getSubscriptionHistory(ctx.user.id)];
                case 1:
                    history = _c.sent();
                    if (!history.length) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Subscription not found",
                        });
                    }
                    if (!(input.status === "completed")) return [3 /*break*/, 4];
                    // Activate public profile
                    return [4 /*yield*/, db.activatePublicProfile(ctx.user.id)];
                case 2:
                    // Activate public profile
                    _c.sent();
                    // Log audit event
                    return [4 /*yield*/, db.createAuditLog({
                            event: "subscription_confirmed",
                            userId: ctx.user.id,
                            description: "Subscription confirmed - Transaction: ".concat(input.transactionId),
                            severity: "low",
                        })];
                case 3:
                    // Log audit event
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Subscription activated!" }];
                case 4: 
                // Log failed payment
                return [4 /*yield*/, db.createAuditLog({
                        event: "subscription_failed",
                        userId: ctx.user.id,
                        description: "Subscription payment failed - Transaction: ".concat(input.transactionId),
                        severity: "medium",
                    })];
                case 5:
                    // Log failed payment
                    _c.sent();
                    return [2 /*return*/, { success: false, message: "Payment failed" }];
            }
        });
    }); }),
    // Admin: Get all subscriptions
    getAllSubscriptions: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            if (ctx.user.role !== "admin") {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            // This would need a db function to get all subscriptions
            return [2 /*return*/, []];
        });
    }); }),
    // Admin: Get fraud alerts
    getFraudAlerts: protectedProcedure
        .input(z.object({
        limit: z.number().default(50),
        isBlocked: z.boolean().optional(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            if (ctx.user.role !== "admin") {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            return [2 /*return*/, db.getFraudAlerts()];
        });
    }); }),
    // Admin: Get audit logs
    getAuditLogs: protectedProcedure
        .input(z.object({
        event: z.string().optional(),
        severity: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            if (ctx.user.role !== "admin") {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            return [2 /*return*/, db.getAuditLogs(input)];
        });
    }); }),
    // Admin: Block user account
    blockUserAccount: protectedProcedure
        .input(z.object({
        userId: z.number(),
        reason: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (ctx.user.role !== "admin") {
                        throw new TRPCError({ code: "FORBIDDEN" });
                    }
                    return [4 /*yield*/, db.blockUserAccount(input.userId)];
                case 1:
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "User account blocked" }];
            }
        });
    }); }),
    // Admin: Resolve fraud alert
    resolveFraudAlert: protectedProcedure
        .input(z.object({
        fraudId: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (ctx.user.role !== "admin") {
                        throw new TRPCError({ code: "FORBIDDEN" });
                    }
                    return [4 /*yield*/, db.resolveFraudAlert(input.fraudId, ctx.user.id)];
                case 1:
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Fraud alert resolved" }];
            }
        });
    }); }),
    // Get integrity check status (admin only)
    getIntegrityStatus: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            if (ctx.user.role !== "admin") {
                throw new TRPCError({ code: "FORBIDDEN" });
            }
            return [2 /*return*/, db.getAllIntegrityChecks()];
        });
    }); }),
});
