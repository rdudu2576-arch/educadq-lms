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
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../../infra/db.js";
import { TRPCError } from "@trpc/server";
import { passwordResetTokens, users } from "../../infra/schema.pg.js";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "../../services/emailNotifications.js";
export var passwordResetRouter = router({
    // Request password reset
    requestReset: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, user, token, expiresAt, error_1;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.email, input.email))
                            .limit(1)];
                case 2:
                    user = _c.sent();
                    if (user.length === 0) {
                        // Don't reveal if email exists
                        return [2 /*return*/, { success: true, message: "If email exists, reset link will be sent" }];
                    }
                    token = randomUUID();
                    expiresAt = new Date(Date.now() + 60 * 60 * 1000);
                    return [4 /*yield*/, db.insert(passwordResetTokens).values({
                            userId: user[0].id,
                            token: token,
                            expiresAt: expiresAt,
                            used: false,
                        })];
                case 3:
                    _c.sent();
                    // Send email with reset link
                    return [4 /*yield*/, sendPasswordResetEmail(user[0].email || "", token)];
                case 4:
                    // Send email with reset link
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Password reset link sent to email" }];
                case 5:
                    error_1 = _c.sent();
                    console.error("Password reset error:", error_1);
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to process password reset request",
                    });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    // Validate reset token
    validateToken: publicProcedure
        .input(z.object({ token: z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, resetToken, error_2;
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
                    return [4 /*yield*/, db
                            .select()
                            .from(passwordResetTokens)
                            .where(and(eq(passwordResetTokens.token, input.token), eq(passwordResetTokens.used, false), gt(passwordResetTokens.expiresAt, new Date())))
                            .limit(1)];
                case 2:
                    resetToken = _c.sent();
                    if (resetToken.length === 0) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Invalid or expired reset token",
                        });
                    }
                    return [2 /*return*/, { valid: true, token: input.token }];
                case 3:
                    error_2 = _c.sent();
                    if (error_2 instanceof TRPCError)
                        throw error_2;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to validate reset token",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Reset password with token
    resetPassword: publicProcedure
        .input(z.object({
        token: z.string(),
        password: z.string().min(8),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, resetToken, hashedPassword, error_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(passwordResetTokens)
                            .where(and(eq(passwordResetTokens.token, input.token), eq(passwordResetTokens.used, false), gt(passwordResetTokens.expiresAt, new Date())))
                            .limit(1)];
                case 2:
                    resetToken = _c.sent();
                    if (resetToken.length === 0) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Invalid or expired reset token",
                        });
                    }
                    return [4 /*yield*/, bcrypt.hash(input.password, 10)];
                case 3:
                    hashedPassword = _c.sent();
                    // Update user password
                    return [4 /*yield*/, db
                            .update(users)
                            .set({ password: hashedPassword })
                            .where(eq(users.id, resetToken[0].userId))];
                case 4:
                    // Update user password
                    _c.sent();
                    // Mark token as used
                    return [4 /*yield*/, db
                            .update(passwordResetTokens)
                            .set({ used: true })
                            .where(eq(passwordResetTokens.id, resetToken[0].id))];
                case 5:
                    // Mark token as used
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Password reset successfully" }];
                case 6:
                    error_3 = _c.sent();
                    if (error_3 instanceof TRPCError)
                        throw error_3;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to reset password",
                    });
                case 7: return [2 /*return*/];
            }
        });
    }); }),
    // Change password (for authenticated users)
    changePassword: protectedProcedure
        .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, user, validPassword, hashedPassword, error_4;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.id, ctx.user.id))
                            .limit(1)];
                case 2:
                    user = _c.sent();
                    if (user.length === 0 || !user[0].password) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "User not found",
                        });
                    }
                    return [4 /*yield*/, bcrypt.compare(input.currentPassword, user[0].password)];
                case 3:
                    validPassword = _c.sent();
                    if (!validPassword) {
                        throw new TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Current password is incorrect",
                        });
                    }
                    return [4 /*yield*/, bcrypt.hash(input.newPassword, 10)];
                case 4:
                    hashedPassword = _c.sent();
                    // Update password
                    return [4 /*yield*/, db
                            .update(users)
                            .set({ password: hashedPassword })
                            .where(eq(users.id, ctx.user.id))];
                case 5:
                    // Update password
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Password changed successfully" }];
                case 6:
                    error_4 = _c.sent();
                    if (error_4 instanceof TRPCError)
                        throw error_4;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to change password",
                    });
                case 7: return [2 /*return*/];
            }
        });
    }); }),
});
