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
import { router, protectedProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../../infra/db.js";
import { TRPCError } from "@trpc/server";
import { deviceAccounts } from "../../infra/schema.pg.js";
import { eq, and } from "drizzle-orm";
export var deviceAccountsRouter = router({
    // Get all saved accounts for current device
    getDeviceAccounts: protectedProcedure
        .input(z.object({ deviceId: z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, accounts, error_1;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select({
                            id: deviceAccounts.id,
                            userId: deviceAccounts.userId,
                            lastUsed: deviceAccounts.lastUsed,
                            active: deviceAccounts.active,
                        })
                            .from(deviceAccounts)
                            .where(and(eq(deviceAccounts.deviceId, input.deviceId), eq(deviceAccounts.active, true)))];
                case 2:
                    accounts = _c.sent();
                    return [2 /*return*/, accounts];
                case 3:
                    error_1 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch device accounts",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Save or update device account
    saveDeviceAccount: protectedProcedure
        .input(z.object({ deviceId: z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, existing, count, result, error_2;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(deviceAccounts)
                            .where(and(eq(deviceAccounts.deviceId, input.deviceId), eq(deviceAccounts.userId, ctx.user.id)))
                            .limit(1)];
                case 2:
                    existing = _c.sent();
                    if (!(existing.length > 0)) return [3 /*break*/, 4];
                    // Update last used
                    return [4 /*yield*/, db
                            .update(deviceAccounts)
                            .set({ lastUsed: new Date() })
                            .where(and(eq(deviceAccounts.deviceId, input.deviceId), eq(deviceAccounts.userId, ctx.user.id)))];
                case 3:
                    // Update last used
                    _c.sent();
                    return [2 /*return*/, existing[0]];
                case 4: return [4 /*yield*/, db
                        .select()
                        .from(deviceAccounts)
                        .where(eq(deviceAccounts.deviceId, input.deviceId))];
                case 5:
                    count = _c.sent();
                    if (count.length >= 10) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Device account limit reached (max 10)",
                        });
                    }
                    return [4 /*yield*/, db
                            .insert(deviceAccounts)
                            .values({
                            userId: ctx.user.id,
                            deviceId: input.deviceId,
                            lastUsed: new Date(),
                            active: true,
                        }).returning()];
                case 6:
                    result = _c.sent();
                    return [2 /*return*/, result[0]];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_2 = _c.sent();
                    if (error_2 instanceof TRPCError)
                        throw error_2;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to save device account",
                    });
                case 9: return [2 /*return*/];
            }
        });
    }); }),
    // Remove device account
    removeDeviceAccount: protectedProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, error_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db.delete(deviceAccounts).where(eq(deviceAccounts.id, input.id))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    error_3 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to remove device account",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Deactivate all device accounts for logout
    logoutAllDevices: protectedProcedure
        .input(z.object({ deviceId: z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, error_4;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .update(deviceAccounts)
                            .set({ active: false })
                            .where(and(eq(deviceAccounts.deviceId, input.deviceId), eq(deviceAccounts.userId, ctx.user.id)))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    error_4 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to logout from all devices",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
});
