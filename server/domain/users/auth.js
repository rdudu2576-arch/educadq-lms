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
import { loginUser } from "../../services/auth.service.js";
import { createUser, getUserByEmail } from "../../infra/db.js";
import { hashPassword, generateToken } from "../../services/auth.service.js";
var COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
};
export var authRouter = router({
    /**
     * Get current user
     */
    me: publicProcedure.query(function (_a) {
        var ctx = _a.ctx;
        if (!ctx.user) {
            return null;
        }
        return {
            id: ctx.user.id,
            email: ctx.user.email,
            name: ctx.user.name,
            role: ctx.user.role,
            cpf: ctx.user.cpf,
            phone: ctx.user.phone,
            createdAt: ctx.user.createdAt,
        };
    }),
    /**
     * Login with email and password
     */
    login: publicProcedure
        .input(z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c, user, token, error_1, message;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, loginUser(input.email, input.password)];
                case 1:
                    _c = _d.sent(), user = _c.user, token = _c.token;
                    // Set token in httpOnly cookie
                    ctx.res.cookie("token", token, COOKIE_OPTIONS);
                    return [2 /*return*/, {
                            success: true,
                            user: {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                            },
                        }];
                case 2:
                    error_1 = _d.sent();
                    message = error_1 instanceof Error ? error_1.message : "Login failed";
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: message,
                    });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Register new user
     */
    register: publicProcedure
        .input(z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
        name: z.string().min(2, "Nome muito curto"),
        cpf: z.string().optional(),
        rg: z.string().optional(),
        phone: z.string().optional(),
        age: z.string().optional(),
        cep: z.string().optional(),
        address: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var existing, hashedPassword, user, token, error_2, message;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getUserByEmail(input.email)];
                case 1:
                    existing = _c.sent();
                    if (existing) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Usuário com este e-mail já existe",
                        });
                    }
                    return [4 /*yield*/, hashPassword(input.password)];
                case 2:
                    hashedPassword = _c.sent();
                    return [4 /*yield*/, createUser({
                            email: input.email,
                            password: hashedPassword,
                            name: input.name,
                            role: "user",
                            additionalData: {
                                cpf: input.cpf,
                                rg: input.rg,
                                phone: input.phone,
                                age: input.age,
                                address: input.address,
                                city: input.city,
                                state: input.state,
                                cep: input.cep,
                                neighborhood: input.neighborhood,
                                complement: input.complement,
                                number: input.number,
                            }
                        })];
                case 3:
                    user = _c.sent();
                    token = generateToken({
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    });
                    // Set token in httpOnly cookie
                    ctx.res.cookie("token", token, COOKIE_OPTIONS);
                    return [2 /*return*/, {
                            success: true,
                            user: {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                            },
                        }];
                case 4:
                    error_2 = _c.sent();
                    if (error_2 instanceof TRPCError)
                        throw error_2;
                    message = error_2 instanceof Error ? error_2.message : "Erro ao registrar usuário";
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: message,
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Logout
     */
    logout: publicProcedure.mutation(function (_a) {
        var ctx = _a.ctx;
        // Clear token cookie
        ctx.res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        return { success: true };
    }),
    /**
     * Request password reset
     */
    forgotPassword: publicProcedure
        .input(z.object({ email: z.string().email("E-mail inválido") }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var getUserByEmail_1, user, error_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, import("../../infra/db.js")];
                case 1:
                    getUserByEmail_1 = (_c.sent()).getUserByEmail;
                    return [4 /*yield*/, getUserByEmail_1(input.email)];
                case 2:
                    user = _c.sent();
                    // Always return success for security reasons (don't reveal if email exists)
                    if (!user) {
                        return [2 /*return*/, { success: true, message: "Se o e-mail estiver cadastrado, as instruções foram enviadas." }];
                    }
                    // TODO: Integrate with email service (SendGrid, Mailtrap, etc.)
                    console.log("[Auth] Solicita\u00E7\u00E3o de recupera\u00E7\u00E3o de senha para: ".concat(input.email));
                    return [2 /*return*/, { success: true, message: "Se o e-mail estiver cadastrado, as instruções foram enviadas." }];
                case 3:
                    error_3 = _c.sent();
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Erro ao processar solicitação",
                    });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Update own profile
     */
    updateProfile: protectedProcedure
        .input(z.object({
        name: z.string().optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var updateUserProfile, updated, error_4, message;
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
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, import("../../infra/db.js")];
                case 2:
                    updateUserProfile = (_c.sent()).updateUserProfile;
                    return [4 /*yield*/, updateUserProfile(ctx.user.id, input)];
                case 3:
                    updated = _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            user: updated,
                        }];
                case 4:
                    error_4 = _c.sent();
                    message = error_4 instanceof Error ? error_4.message : "Failed to update profile";
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: message,
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get user by ID (admin only)
     */
    getUserById: protectedProcedure
        .input(z.object({ userId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var getUserById, user, error_5;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!ctx.user || ctx.user.role !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Only admins can view user details",
                        });
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, import("../../services/auth.service.js")];
                case 2:
                    getUserById = (_c.sent()).getUserById;
                    return [4 /*yield*/, getUserById(input.userId)];
                case 3:
                    user = _c.sent();
                    if (!user) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "User not found",
                        });
                    }
                    return [2 /*return*/, {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            cpf: user.cpf,
                            phone: user.phone,
                            createdAt: user.createdAt,
                        }];
                case 4:
                    error_5 = _c.sent();
                    if (error_5 instanceof TRPCError)
                        throw error_5;
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to get user",
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Update user role (admin only)
     */
    updateUserRole: protectedProcedure
        .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "professor", "user"]),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var updateUserRole, updated, error_6, message;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!ctx.user || ctx.user.role !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Only admins can update user roles",
                        });
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, import("../../infra/db.js")];
                case 2:
                    updateUserRole = (_c.sent()).updateUserRole;
                    return [4 /*yield*/, updateUserRole(input.userId, input.role)];
                case 3:
                    updated = _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            user: updated,
                        }];
                case 4:
                    error_6 = _c.sent();
                    message = error_6 instanceof Error ? error_6.message : "Failed to update role";
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: message,
                    });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
});
