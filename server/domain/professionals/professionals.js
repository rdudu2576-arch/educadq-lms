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
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc.js";
import { getDb } from "../../infra/db.js";
import { studentProfiles } from "../../infra/schema.pg.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
export var professionalsRouter = router({
    // Get all professionals (public)
    list: publicProcedure
        .input(z.object({
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, professionals;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database
                            .select()
                            .from(studentProfiles)
                            .where(eq(studentProfiles.isPublic, true))
                            .limit(input.limit)
                            .offset(input.offset)];
                case 2:
                    professionals = _c.sent();
                    return [2 /*return*/, professionals];
            }
        });
    }); }),
    // Get professional by ID (public)
    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, professional;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database
                            .select()
                            .from(studentProfiles)
                            .where(and(eq(studentProfiles.id, input.id), eq(studentProfiles.isPublic, true)))
                            .limit(1)];
                case 2:
                    professional = _c.sent();
                    if (!professional || professional.length === 0) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Profissional não encontrado",
                        });
                    }
                    return [2 /*return*/, professional[0]];
            }
        });
    }); }),
    // Create professional (admin only)
    create: protectedProcedure
        .input(z.object({
        publicName: z.string().min(3),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
        userId: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, result;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem criar profissionais",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database.insert(studentProfiles).values({
                            userId: input.userId,
                            publicName: input.publicName,
                            bio: input.bio || "",
                            profileImageUrl: input.profileImageUrl || "",
                            isPublic: false, // Começa desativado
                            score: 0,
                            level: "iniciante",
                        }).returning()];
                case 2:
                    result = _d.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Update professional (admin only)
    update: protectedProcedure
        .input(z.object({
        id: z.number(),
        publicName: z.string().optional(),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
        score: z.number().optional(),
        level: z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, id, updateData, result;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem atualizar profissionais",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    id = input.id, updateData = __rest(input, ["id"]);
                    return [4 /*yield*/, database
                            .update(studentProfiles)
                            .set(updateData)
                            .where(eq(studentProfiles.id, id)).returning()];
                case 2:
                    result = _d.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Delete professional (admin only)
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem deletar profissionais",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database
                            .delete(studentProfiles)
                            .where(eq(studentProfiles.id, input.id))];
                case 2:
                    _d.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    // Get all professionals for admin (admin only)
    getAllForAdmin: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, professionals;
        var _c;
        var ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem acessar esta função",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database
                            .select()
                            .from(studentProfiles)
                            .orderBy(studentProfiles.score)];
                case 2:
                    professionals = _d.sent();
                    return [2 /*return*/, professionals];
            }
        });
    }); }),
    // Toggle professional status (admin only)
    toggleStatus: protectedProcedure
        .input(z.object({ id: z.number(), active: z.boolean() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem alterar status",
                        });
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    database = _d.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database
                            .update(studentProfiles)
                            .set({ isPublic: input.active })
                            .where(eq(studentProfiles.id, input.id))];
                case 2:
                    _d.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    // Update professional profile (user can update their own)
    updateProfile: protectedProcedure
        .input(z.object({
        email: z.string().email(),
        publicName: z.string(),
        phone: z.string(),
        city: z.string(),
        state: z.string(),
        professionalBio: z.string(),
        formation: z.string(),
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
        facebook: z.string().optional(),
        youtube: z.string().optional(),
        otherSocial: z.string().optional(),
        professionalPhone: z.string().optional(),
        professionalEmail: z.string().optional(),
        otherContacts: z.string().optional(),
        profileImageUrl: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, existingProfile;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
                    return [4 /*yield*/, database
                            .select()
                            .from(studentProfiles)
                            .where(eq(studentProfiles.userId, ctx.user.id))
                            .limit(1)];
                case 2:
                    existingProfile = _c.sent();
                    if (!(existingProfile && existingProfile.length > 0)) return [3 /*break*/, 4];
                    // Update existing profile
                    return [4 /*yield*/, database
                            .update(studentProfiles)
                            .set(__assign(__assign({}, input), { paymentStatus: "pending", updatedAt: new Date() }))
                            .where(eq(studentProfiles.userId, ctx.user.id))];
                case 3:
                    // Update existing profile
                    _c.sent();
                    return [3 /*break*/, 6];
                case 4: 
                // Create new profile
                return [4 /*yield*/, database.insert(studentProfiles).values({
                        userId: ctx.user.id,
                        publicName: input.publicName,
                        email: input.email,
                        phone: input.phone,
                        city: input.city,
                        state: input.state,
                        professionalBio: input.professionalBio,
                        formation: input.formation,
                        linkedin: input.linkedin,
                        instagram: input.instagram,
                        website: input.website,
                        facebook: input.facebook,
                        youtube: input.youtube,
                        otherSocial: input.otherSocial,
                        professionalPhone: input.professionalPhone,
                        professionalEmail: input.professionalEmail,
                        otherContacts: input.otherContacts,
                        profileImageUrl: input.profileImageUrl,
                        paymentStatus: "pending",
                        isPublic: false,
                        score: 0,
                        level: "iniciante",
                    })];
                case 5:
                    // Create new profile
                    _c.sent();
                    _c.label = 6;
                case 6: return [2 /*return*/, { success: true }];
            }
        });
    }); }),
});
