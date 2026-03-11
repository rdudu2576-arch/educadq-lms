var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../../infra/db.js";
import { TRPCError } from "@trpc/server";
import { registrationFields, userRegistrationData } from "../../infra/schema.pg.js";
import { eq, asc, and } from "drizzle-orm";
export var registrationRouter = router({
    // Get all active registration fields for public form
    getFields: publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, fields, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(registrationFields)
                            .where(eq(registrationFields.active, true))
                            .orderBy(asc(registrationFields.order))];
                case 2:
                    fields = _a.sent();
                    return [2 /*return*/, fields.map(function (field) { return (__assign(__assign({}, field), { options: field.options ? JSON.parse(field.options) : null })); })];
                case 3:
                    error_1 = _a.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch registration fields",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Get all registration fields (admin only)
    getAllFields: adminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, fields, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(registrationFields)
                            .orderBy(asc(registrationFields.order))];
                case 2:
                    fields = _a.sent();
                    return [2 /*return*/, fields.map(function (field) { return (__assign(__assign({}, field), { options: field.options ? JSON.parse(field.options) : null })); })];
                case 3:
                    error_2 = _a.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch registration fields",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Create new registration field (admin only)
    createField: adminProcedure
        .input(z.object({
        label: z.string().min(1),
        type: z.enum(["text", "select", "number", "textarea", "checkbox", "date"]),
        required: z.boolean().default(false),
        order: z.number().int().default(0),
        options: z.array(z.string()).optional(),
    }))
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
                    return [4 /*yield*/, db
                            .insert(registrationFields)
                            .values({
                            label: input.label,
                            type: input.type,
                            required: input.required,
                            order: input.order,
                            options: input.options ? JSON.stringify(input.options) : null,
                            active: true,
                        })];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Field created successfully" }];
                case 3:
                    error_3 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create registration field",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Update registration field (admin only)
    updateField: adminProcedure
        .input(z.object({
        id: z.number().int(),
        label: z.string().min(1).optional(),
        type: z.enum(["text", "select", "number", "textarea", "checkbox", "date"]).optional(),
        required: z.boolean().optional(),
        active: z.boolean().optional(),
        order: z.number().int().optional(),
        options: z.array(z.string()).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, id, updates, data, error_4;
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
                    id = input.id, updates = __rest(input, ["id"]);
                    data = __assign({}, updates);
                    if (updates.options)
                        data.options = JSON.stringify(updates.options);
                    return [4 /*yield*/, db
                            .update(registrationFields)
                            .set(data)
                            .where(eq(registrationFields.id, id))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true, message: "Field updated successfully" }];
                case 3:
                    error_4 = _c.sent();
                    if (error_4 instanceof TRPCError)
                        throw error_4;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to update registration field",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Delete registration field (admin only)
    deleteField: adminProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, error_5;
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
                    return [4 /*yield*/, db.delete(registrationFields).where(eq(registrationFields.id, input.id))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    error_5 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to delete registration field",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Save user registration data
    saveUserData: protectedProcedure
        .input(z.object({
        fieldId: z.number().int(),
        value: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, existing, result, error_6;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    if (!ctx.user) {
                        throw new TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Not authenticated",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(userRegistrationData)
                            .where(and(eq(userRegistrationData.userId, ctx.user.id), eq(userRegistrationData.fieldId, input.fieldId)))
                            .limit(1)];
                case 2:
                    existing = _c.sent();
                    if (!(existing.length > 0)) return [3 /*break*/, 4];
                    // Update
                    return [4 /*yield*/, db
                            .update(userRegistrationData)
                            .set({ value: input.value })
                            .where(and(eq(userRegistrationData.userId, ctx.user.id), eq(userRegistrationData.fieldId, input.fieldId)))];
                case 3:
                    // Update
                    _c.sent();
                    return [2 /*return*/, existing[0]];
                case 4: return [4 /*yield*/, db
                        .insert(userRegistrationData)
                        .values({
                        userId: ctx.user.id,
                        fieldId: input.fieldId,
                        value: input.value,
                    }).returning()];
                case 5:
                    result = _c.sent();
                    return [2 /*return*/, result[0]];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_6 = _c.sent();
                    if (error_6 instanceof TRPCError)
                        throw error_6;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to save registration data",
                    });
                case 8: return [2 /*return*/];
            }
        });
    }); }),
    // Get user's registration data
    getUserData: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, data, error_7;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    if (!ctx.user) {
                        throw new TRPCError({
                            code: "UNAUTHORIZED",
                            message: "Not authenticated",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    return [4 /*yield*/, db
                            .select()
                            .from(userRegistrationData)
                            .where(eq(userRegistrationData.userId, ctx.user.id))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data];
                case 3:
                    error_7 = _c.sent();
                    if (error_7 instanceof TRPCError)
                        throw error_7;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch user registration data",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
});
