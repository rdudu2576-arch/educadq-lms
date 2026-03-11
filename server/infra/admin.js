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
import { adminProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { getCourses, getCourseEnrollments, getOverduePayments, getPaymentsByStudent, getDb, } from "./db.js";
import { users } from "../infra/schema.pg.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
export var adminRouter = router({
    // Get dashboard statistics
    getStatistics: adminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var courses, totalCourses, enrollments_data, totalStudents, totalRevenue, allEnrollments, _i, allEnrollments_1, enrollment, payments_data, overdueInstallments, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, getCourses(100, 0)];
                case 1:
                    courses = _a.sent();
                    totalCourses = courses.length;
                    return [4 /*yield*/, Promise.all(courses.map(function (course) { return getCourseEnrollments(course.id); }))];
                case 2:
                    enrollments_data = _a.sent();
                    totalStudents = new Set(enrollments_data.flat().map(function (e) { return e.studentId; })).size;
                    totalRevenue = 0;
                    allEnrollments = enrollments_data.flat();
                    _i = 0, allEnrollments_1 = allEnrollments;
                    _a.label = 3;
                case 3:
                    if (!(_i < allEnrollments_1.length)) return [3 /*break*/, 6];
                    enrollment = allEnrollments_1[_i];
                    return [4 /*yield*/, getPaymentsByStudent(enrollment.studentId)];
                case 4:
                    payments_data = _a.sent();
                    totalRevenue += payments_data.reduce(function (sum, p) { return sum + parseFloat(p.amount.toString()); }, 0);
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, getOverduePayments()];
                case 7:
                    overdueInstallments = _a.sent();
                    return [2 /*return*/, {
                            totalCourses: totalCourses,
                            totalStudents: totalStudents,
                            totalRevenue: totalRevenue,
                            overdueInstallments: overdueInstallments.length,
                        }];
                case 8:
                    error_1 = _a.sent();
                    console.error("Error getting statistics:", error_1);
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    }); }),
    // Get all users
    getUsers: adminProcedure
        .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        role: z.enum(["admin", "professor", "user"]).optional(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result, error_2;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(users).limit(input.limit).offset(input.offset)];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result];
                case 3:
                    error_2 = _c.sent();
                    console.error("Error getting users:", error_2);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // Create user
    createUser: adminProcedure
        .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6).optional(),
        role: z.enum(["admin", "professor", "user"]),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, existing, passwordToHash, hashedPassword, error_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    return [4 /*yield*/, db.select().from(users).where(eq(users.email, input.email)).limit(1)];
                case 2:
                    existing = _c.sent();
                    if (existing.length > 0) {
                        throw new TRPCError({ code: "BAD_REQUEST", message: "E-mail já cadastrado" });
                    }
                    passwordToHash = input.password || Math.random().toString(36).slice(-8);
                    return [4 /*yield*/, bcrypt.hash(passwordToHash, 10)];
                case 3:
                    hashedPassword = _c.sent();
                    // Insert user
                    return [4 /*yield*/, db.insert(users).values({
                            openId: "".concat(input.email, "-").concat(Date.now()),
                            name: input.name,
                            email: input.email,
                            password: hashedPassword,
                            role: input.role,
                        })];
                case 4:
                    // Insert user
                    _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            message: "Usuário criado com sucesso",
                            tempPassword: input.password ? undefined : passwordToHash
                        }];
                case 5:
                    error_3 = _c.sent();
                    console.error("Error creating user:", error_3);
                    throw new TRPCError({
                        code: error_3 instanceof TRPCError ? error_3.code : "INTERNAL_SERVER_ERROR",
                        message: error_3.message || "Erro ao criar usuário"
                    });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    // Update user
    updateUser: adminProcedure
        .input(z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["admin", "professor", "user"]).optional(),
        password: z.string().min(6).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, updateData, _c, error_4;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _d.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    updateData = { updatedAt: new Date() };
                    if (input.name)
                        updateData.name = input.name;
                    if (input.email)
                        updateData.email = input.email;
                    if (input.role)
                        updateData.role = input.role;
                    if (!input.password) return [3 /*break*/, 3];
                    _c = updateData;
                    return [4 /*yield*/, bcrypt.hash(input.password, 10)];
                case 2:
                    _c.password = _d.sent();
                    _d.label = 3;
                case 3: return [4 /*yield*/, db.update(users).set(updateData).where(eq(users.id, input.userId))];
                case 4:
                    _d.sent();
                    return [2 /*return*/, { success: true, message: "Usuário atualizado com sucesso" }];
                case 5:
                    error_4 = _d.sent();
                    console.error("Error updating user:", error_4);
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar usuário" });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    // Reset password
    resetPassword: adminProcedure
        .input(z.object({ userId: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, newPassword, hashedPassword, error_5;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    newPassword = Math.random().toString(36).slice(-8);
                    return [4 /*yield*/, bcrypt.hash(newPassword, 10)];
                case 2:
                    hashedPassword = _c.sent();
                    return [4 /*yield*/, db.update(users).set({ password: hashedPassword }).where(eq(users.id, input.userId))];
                case 3:
                    _c.sent();
                    return [2 /*return*/, { success: true, newPassword: newPassword }];
                case 4:
                    error_5 = _c.sent();
                    console.error("Error resetting password:", error_5);
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao redefinir senha" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
});
