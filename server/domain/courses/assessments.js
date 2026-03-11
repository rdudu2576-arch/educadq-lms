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
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../_core/trpc.js";
import { assessments, questions, questionOptions, studentAnswers, assessmentResults, courses } from "../../infra/schema.pg.js";
import { getDb } from "../../infra/db.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
export var assessmentsRouter = router({
    create: protectedProcedure
        .input(z.object({
        courseId: z.number(),
        lessonId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["quiz", "assignment", "exam"]).default("exam"),
        passingScore: z.number().optional(),
        maxAttempts: z.number().optional(),
        timeLimit: z.number().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, courseResult, course, result;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _e.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    return [4 /*yield*/, db.select().from(courses).where(eq(courses.id, input.courseId)).limit(1)];
                case 2:
                    courseResult = _e.sent();
                    course = courseResult[0];
                    if (!course)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Curso nao encontrado" });
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) !== course.professorId) {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
                    }
                    return [4 /*yield*/, db.insert(assessments).values({
                            courseId: input.courseId,
                            lessonId: input.lessonId,
                            title: input.title,
                            description: input.description,
                            type: input.type,
                            passingScore: input.passingScore,
                            maxAttempts: input.maxAttempts,
                            timeLimit: input.timeLimit,
                        }).returning()];
                case 3:
                    result = _e.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    getByCourse: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(assessments).where(eq(assessments.courseId, input.courseId))];
                case 2: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getById: protectedProcedure
        .input(z.object({ assessmentId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, assessmentResult, assessment, questionsList, questionsWithOptions;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    return [4 /*yield*/, db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1)];
                case 2:
                    assessmentResult = _c.sent();
                    assessment = assessmentResult[0];
                    if (!assessment)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
                    return [4 /*yield*/, db.select().from(questions).where(eq(questions.assessmentId, input.assessmentId))];
                case 3:
                    questionsList = _c.sent();
                    return [4 /*yield*/, Promise.all(questionsList.map(function (q) { return __awaiter(void 0, void 0, void 0, function () {
                            var options;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.select().from(questionOptions).where(eq(questionOptions.questionId, q.id))];
                                    case 1:
                                        options = _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, q), { options: options })];
                                }
                            });
                        }); }))];
                case 4:
                    questionsWithOptions = _c.sent();
                    return [2 /*return*/, __assign(__assign({}, assessment), { questions: questionsWithOptions })];
            }
        });
    }); }),
    createQuestion: protectedProcedure
        .input(z.object({
        assessmentId: z.number(),
        title: z.string().min(1),
        type: z.enum(["multiple_choice", "true_false", "short_answer"]).default("multiple_choice"),
        order: z.number().min(1),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, assessmentResult, assessment, courseResult, course, result;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _e.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    return [4 /*yield*/, db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1)];
                case 2:
                    assessmentResult = _e.sent();
                    assessment = assessmentResult[0];
                    if (!assessment)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
                    if (!assessment.courseId) return [3 /*break*/, 4];
                    return [4 /*yield*/, db.select().from(courses).where(eq(courses.id, assessment.courseId)).limit(1)];
                case 3:
                    courseResult = _e.sent();
                    course = courseResult[0];
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id) !== (course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
                    }
                    _e.label = 4;
                case 4: return [4 /*yield*/, db.insert(questions).values({
                        assessmentId: input.assessmentId,
                        title: input.title,
                        type: input.type,
                        order: input.order,
                    }).returning()];
                case 5:
                    result = _e.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    createQuestionOptions: protectedProcedure
        .input(z.object({
        questionId: z.number(),
        options: z.array(z.object({
            text: z.string().min(1),
            isCorrect: z.boolean(),
            order: z.number(),
        })),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, correctCount;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _e.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin" && ((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "professor") {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao" });
                    }
                    if (input.options.length !== 5) {
                        throw new TRPCError({ code: "BAD_REQUEST", message: "Deve ter exatamente 5 alternativas" });
                    }
                    correctCount = input.options.filter(function (a) { return a.isCorrect; }).length;
                    if (correctCount !== 1) {
                        throw new TRPCError({ code: "BAD_REQUEST", message: "Deve ter exatamente 1 alternativa correta" });
                    }
                    return [4 /*yield*/, Promise.all(input.options.map(function (opt) {
                            return db.insert(questionOptions).values({
                                questionId: input.questionId,
                                text: opt.text,
                                isCorrect: opt.isCorrect,
                                order: opt.order,
                            }).returning();
                        }))];
                case 2: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    submit: protectedProcedure
        .input(z.object({
        assessmentId: z.number(),
        answers: z.array(z.object({
            questionId: z.number(),
            selectedOptionId: z.number(),
        })),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, studentId, assessmentResult, assessment, questionsList, correctCount, _loop_1, _i, _c, answer, total, percentage, passingScore, passed;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _d.sent();
                    if (!db)
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
                    studentId = ctx.user.id;
                    return [4 /*yield*/, db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1)];
                case 2:
                    assessmentResult = _d.sent();
                    assessment = assessmentResult[0];
                    if (!assessment)
                        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliacao nao encontrada" });
                    return [4 /*yield*/, db.select().from(questions).where(eq(questions.assessmentId, input.assessmentId))];
                case 3:
                    questionsList = _d.sent();
                    correctCount = 0;
                    _loop_1 = function (answer) {
                        var question, options, correctOption, isCorrect;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    question = questionsList.find(function (q) { return q.id === answer.questionId; });
                                    if (!question)
                                        return [2 /*return*/, "continue"];
                                    return [4 /*yield*/, db.select().from(questionOptions).where(eq(questionOptions.questionId, question.id))];
                                case 1:
                                    options = _e.sent();
                                    correctOption = options.find(function (o) { return o.isCorrect; });
                                    isCorrect = (correctOption === null || correctOption === void 0 ? void 0 : correctOption.id) === answer.selectedOptionId;
                                    if (isCorrect)
                                        correctCount++;
                                    return [4 /*yield*/, db.insert(studentAnswers).values({
                                            studentId: studentId,
                                            assessmentId: input.assessmentId,
                                            questionId: answer.questionId,
                                            selectedOptionId: answer.selectedOptionId,
                                            isCorrect: isCorrect,
                                        })];
                                case 2:
                                    _e.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _c = input.answers;
                    _d.label = 4;
                case 4:
                    if (!(_i < _c.length)) return [3 /*break*/, 7];
                    answer = _c[_i];
                    return [5 /*yield**/, _loop_1(answer)];
                case 5:
                    _d.sent();
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    total = questionsList.length;
                    percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
                    passingScore = assessment.passingScore || 70;
                    passed = percentage >= passingScore;
                    return [4 /*yield*/, db.insert(assessmentResults).values({
                            studentId: studentId,
                            assessmentId: input.assessmentId,
                            score: percentage.toString(),
                            passed: passed,
                            attemptNumber: 1,
                        })];
                case 8:
                    _d.sent();
                    return [2 /*return*/, {
                            correct: correctCount,
                            total: total,
                            percentage: percentage,
                            passed: passed,
                            passingScore: passingScore,
                        }];
            }
        });
    }); }),
});
