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
import { protectedProcedure, router } from "../../_core/trpc.js";
import { recordLessonProgress, getStudentLessonProgress, calculateCourseProgress, getEnrollmentStatus, getLessonById, getCourseById, getModuleById, getStudentAssessmentScore, getAssessmentById, recordStudentAnswer, getOptionsByQuestion, createCertificate, getCertificateByCourse, } from "../../infra/db.js";
import { z } from "zod";
// Generate unique certificate number
function generateCertificateNumber() {
    var now = new Date();
    var year = now.getFullYear();
    var random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return "EDQ-".concat(year, "-").concat(random);
}
// Check if student completed 100% and auto-generate certificate
function checkAndIssueCertificate(studentId, courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var progress, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, calculateCourseProgress(studentId, courseId)];
                case 1:
                    progress = _a.sent();
                    if (!(progress >= 100)) return [3 /*break*/, 4];
                    return [4 /*yield*/, getCertificateByCourse(studentId, courseId)];
                case 2:
                    existing = _a.sent();
                    if (!!existing) return [3 /*break*/, 4];
                    return [4 /*yield*/, createCertificate({
                            studentId: studentId,
                            courseId: courseId,
                            certificateNumber: generateCertificateNumber(),
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
export var progressRouter = router({
    recordCompletion: protectedProcedure
        .input(z.object({ lessonId: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lesson, mod, enrollment, certificateIssued;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getLessonById(input.lessonId)];
                case 1:
                    lesson = _c.sent();
                    if (!lesson)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });
                    return [4 /*yield*/, getModuleById(lesson.moduleId)];
                case 2:
                    mod = _c.sent();
                    if (!mod)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Modulo nao encontrado" });
                    return [4 /*yield*/, getEnrollmentStatus(ctx.user.id, mod.courseId)];
                case 3:
                    enrollment = _c.sent();
                    if (!enrollment)
                        throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });
                    return [4 /*yield*/, recordLessonProgress(ctx.user.id, input.lessonId)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, checkAndIssueCertificate(ctx.user.id, mod.courseId)];
                case 5:
                    certificateIssued = _c.sent();
                    return [2 /*return*/, { success: true, certificateIssued: certificateIssued }];
            }
        });
    }); }),
    getCourseProgress: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var enrollment, progress, percentage;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getEnrollmentStatus(ctx.user.id, input.courseId)];
                case 1:
                    enrollment = _c.sent();
                    if (!enrollment)
                        throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });
                    return [4 /*yield*/, getStudentLessonProgress(ctx.user.id, input.courseId)];
                case 2:
                    progress = _c.sent();
                    return [4 /*yield*/, calculateCourseProgress(ctx.user.id, input.courseId)];
                case 3:
                    percentage = _c.sent();
                    return [2 /*return*/, { progress: progress, percentage: percentage }];
            }
        });
    }); }),
    getCourseProgressReport: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var course;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getCourseById(input.courseId)];
                case 1:
                    course = _e.sent();
                    if (!course)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) !== course.professorId) {
                        throw new TRPCError({ code: "FORBIDDEN" });
                    }
                    return [2 /*return*/, { courseId: input.courseId }];
            }
        });
    }); }),
    submitAnswer: protectedProcedure
        .input(z.object({
        assessmentId: z.number(),
        questionId: z.number(),
        alternativeId: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var assessment, courseId, enrollment, options, selected;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getAssessmentById(input.assessmentId)];
                case 1:
                    assessment = _c.sent();
                    if (!assessment)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
                    courseId = assessment.courseId;
                    if (!courseId) return [3 /*break*/, 3];
                    return [4 /*yield*/, getEnrollmentStatus(ctx.user.id, courseId)];
                case 2:
                    enrollment = _c.sent();
                    if (!enrollment)
                        throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });
                    _c.label = 3;
                case 3: return [4 /*yield*/, getOptionsByQuestion(input.questionId)];
                case 4:
                    options = _c.sent();
                    selected = options.find(function (a) { return a.id === input.alternativeId; });
                    if (!selected)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Alternativa nao encontrada" });
                    return [4 /*yield*/, recordStudentAnswer({
                            studentId: ctx.user.id,
                            assessmentId: input.assessmentId,
                            questionId: input.questionId,
                            selectedOptionId: input.alternativeId,
                            isCorrect: selected.isCorrect,
                        })];
                case 5:
                    _c.sent();
                    return [2 /*return*/, { isCorrect: selected.isCorrect }];
            }
        });
    }); }),
    getAssessmentScore: protectedProcedure
        .input(z.object({ assessmentId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var assessment, courseId, enrollment;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getAssessmentById(input.assessmentId)];
                case 1:
                    assessment = _c.sent();
                    if (!assessment)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
                    courseId = assessment.courseId;
                    if (!courseId) return [3 /*break*/, 3];
                    return [4 /*yield*/, getEnrollmentStatus(ctx.user.id, courseId)];
                case 2:
                    enrollment = _c.sent();
                    if (!enrollment)
                        throw new TRPCError({ code: "FORBIDDEN", message: "Voce nao esta matriculado" });
                    _c.label = 3;
                case 3: return [4 /*yield*/, getStudentAssessmentScore(ctx.user.id, input.assessmentId)];
                case 4: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getCompletedCourses: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            return [2 /*return*/, []];
        });
    }); }),
    getProgressSummary: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            return [2 /*return*/, {
                    totalCourses: 0,
                    completedCourses: 0,
                    inProgressCourses: 0,
                    averageProgress: 0,
                    completionRate: 0,
                }];
        });
    }); }),
});
