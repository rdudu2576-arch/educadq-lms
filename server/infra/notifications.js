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
import { protectedProcedure, router } from "../_core/trpc.js";
import { z } from "zod";
import { getDb } from "./db.js";
import { notifications } from "../infra/schema.pg.js";
import { eq, and } from "drizzle-orm";
export var notificationsRouter = router({
    /**
     * Get notifications for current user
     */
    getMyNotifications: protectedProcedure
        .input(z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, userNotifications;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database not available",
                        });
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(notifications)
                            .where(eq(notifications.userId, ctx.user.id))
                            .orderBy(notifications.createdAt)
                            .limit(input.limit)
                            .offset(input.offset)];
                case 2:
                    userNotifications = _c.sent();
                    return [2 /*return*/, userNotifications];
            }
        });
    }); }),
    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
        .input(z.object({ notificationId: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, notificationRows, notification;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database not available",
                        });
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(notifications)
                            .where(eq(notifications.id, input.notificationId))
                            .limit(1)];
                case 2:
                    notificationRows = _c.sent();
                    notification = notificationRows[0];
                    if (!notification) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Notification not found",
                        });
                    }
                    if (notification.userId !== ctx.user.id) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to update this notification",
                        });
                    }
                    // Mark as read
                    return [4 /*yield*/, db
                            .update(notifications)
                            .set({ isRead: true })
                            .where(eq(notifications.id, input.notificationId))];
                case 3:
                    // Mark as read
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    /**
     * Mark all notifications as read
     */
    markAllAsRead: protectedProcedure.mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database not available",
                        });
                    }
                    return [4 /*yield*/, db
                            .update(notifications)
                            .set({ isRead: true })
                            .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    /**
     * Delete notification
     */
    deleteNotification: protectedProcedure
        .input(z.object({ notificationId: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, notificationRows, notification;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database not available",
                        });
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(notifications)
                            .where(eq(notifications.id, input.notificationId))
                            .limit(1)];
                case 2:
                    notificationRows = _c.sent();
                    notification = notificationRows[0];
                    if (!notification) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Notification not found",
                        });
                    }
                    if (notification.userId !== ctx.user.id) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to delete this notification",
                        });
                    }
                    return [4 /*yield*/, db
                            .delete(notifications)
                            .where(eq(notifications.id, input.notificationId))];
                case 3:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    /**
     * Get unread notification count
     */
    getUnreadCount: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Database not available",
                        });
                    }
                    return [4 /*yield*/, db
                            .select({ count: notifications.id })
                            .from(notifications)
                            .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)))];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, { unreadCount: result.length }];
            }
        });
    }); }),
});
