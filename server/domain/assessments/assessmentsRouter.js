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
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { assessments, questions, questionOptions, studentAnswers } from "../../infra/schema.pg.js";
import { eq } from "drizzle-orm";
import { getDb } from "../../infra/db.js";
export var assessmentsRouter = router({
    // Get assessments for a course
    getCourseAssessments: publicProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(assessments)
                            .where(eq(assessments.courseId, input.courseId))];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result];
            }
        });
    }); }),
    // Get assessment details with questions
    getAssessmentDetails: publicProcedure
        .input(z.object({ assessmentId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, assessment, qs, questionsWithOptions;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(assessments)
                            .where(eq(assessments.id, input.assessmentId))];
                case 2:
                    assessment = _c.sent();
                    if (!assessment.length)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db
                            .select()
                            .from(questions)
                            .where(eq(questions.assessmentId, input.assessmentId))];
                case 3:
                    qs = _c.sent();
                    return [4 /*yield*/, Promise.all(qs.map(function (q) { return __awaiter(void 0, void 0, void 0, function () {
                            var opts;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db
                                            .select()
                                            .from(questionOptions)
                                            .where(eq(questionOptions.questionId, q.id))];
                                    case 1:
                                        opts = _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, q), { options: opts })];
                                }
                            });
                        }); }))];
                case 4:
                    questionsWithOptions = _c.sent();
                    return [2 /*return*/, __assign(__assign({}, assessment[0]), { questions: questionsWithOptions })];
            }
        });
    }); }),
    // Create assessment (admin/professor only)
    createAssessment: protectedProcedure
        .input(z.object({
        courseId: z.number(),
        lessonId: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["quiz", "assignment", "exam"]),
        passingScore: z.number().default(70),
        maxAttempts: z.number().default(3),
        timeLimit: z.number().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "professor") {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _e.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, db.insert(assessments).values({
                            courseId: input.courseId,
                            lessonId: input.lessonId || null,
                            title: input.title,
                            description: input.description || null,
                            type: input.type,
                            passingScore: input.passingScore,
                            maxAttempts: input.maxAttempts,
                            timeLimit: input.timeLimit || null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }).returning()];
                case 2:
                    result = _e.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Add question to assessment
    addQuestion: protectedProcedure
        .input(z.object({
        assessmentId: z.number(),
        title: z.string(),
        type: z.enum(["multiple_choice", "true_false", "short_answer"]),
        order: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "professor") {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _e.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, db.insert(questions).values({
                            assessmentId: input.assessmentId,
                            title: input.title,
                            type: input.type,
                            order: input.order,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        }).returning()];
                case 2:
                    result = _e.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Add options to question (for multiple choice)
    addQuestionOption: protectedProcedure
        .input(z.object({
        questionId: z.number(),
        text: z.string(),
        isCorrect: z.boolean(),
        order: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "professor") {
                        throw new Error("Unauthorized");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _e.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, db.insert(questionOptions).values({
                            questionId: input.questionId,
                            text: input.text,
                            isCorrect: input.isCorrect,
                            order: input.order,
                            createdAt: new Date(),
                        }).returning()];
                case 2:
                    result = _e.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Submit assessment answers
    submitAssessment: protectedProcedure
        .input(z.object({
        assessmentId: z.number(),
        answers: z.array(z.object({
            questionId: z.number(),
            selectedOptionId: z.number(),
        })),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, _i, _c, answer, correctCount, _d, _e, answer, option, totalQuestions, score;
        var _f;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.id))
                        throw new Error("Unauthorized");
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _g.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    _i = 0, _c = input.answers;
                    _g.label = 2;
                case 2:
                    if (!(_i < _c.length)) return [3 /*break*/, 5];
                    answer = _c[_i];
                    return [4 /*yield*/, db.insert(studentAnswers).values({
                            studentId: ctx.user.id,
                            assessmentId: input.assessmentId,
                            questionId: answer.questionId,
                            selectedOptionId: answer.selectedOptionId,
                            createdAt: new Date(),
                        })];
                case 3:
                    _g.sent();
                    _g.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    correctCount = 0;
                    _d = 0, _e = input.answers;
                    _g.label = 6;
                case 6:
                    if (!(_d < _e.length)) return [3 /*break*/, 9];
                    answer = _e[_d];
                    return [4 /*yield*/, db
                            .select()
                            .from(questionOptions)
                            .where(eq(questionOptions.id, answer.selectedOptionId))];
                case 7:
                    option = _g.sent();
                    if (option.length && option[0].isCorrect) {
                        correctCount++;
                    }
                    _g.label = 8;
                case 8:
                    _d++;
                    return [3 /*break*/, 6];
                case 9:
                    totalQuestions = input.answers.length;
                    score = Math.round((correctCount / totalQuestions) * 100);
                    return [2 /*return*/, { score: score, passed: score >= 70 }];
            }
        });
    }); }),
});
