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
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getCoursesByProfessor, getLessonsByCourse, getStudentLessonProgress } from "./db.js";
export var professorRouter = router({
    // Get courses assigned to professor
    getCourses: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var courses, error_1;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getCoursesByProfessor(ctx.user.id)];
                case 1:
                    courses = _c.sent();
                    return [2 /*return*/, courses];
                case 2:
                    error_1 = _c.sent();
                    console.error("Error getting professor courses:", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    // Get students in a course
    getCourseStudents: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            // TODO: Implement student listing for course
            return [2 /*return*/, []];
        });
    }); }),
    // Get student progress in course
    getStudentLessonProgress: protectedProcedure
        .input(z.object({
        courseId: z.number(),
        studentId: z.number(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var progress, error_2;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getStudentLessonProgress(input.studentId, input.courseId)];
                case 1:
                    progress = _c.sent();
                    return [2 /*return*/, progress];
                case 2:
                    error_2 = _c.sent();
                    console.error("Error getting student progress:", error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    // Get course analytics
    getCourseAnalytics: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            // TODO: Implement analytics calculation
            return [2 /*return*/, {
                    totalStudents: 0,
                    completedStudents: 0,
                    averageProgress: 0,
                    averageScore: 0,
                }];
        });
    }); }),
    // Send alert to student
    sendStudentAlert: protectedProcedure
        .input(z.object({
        studentId: z.number(),
        message: z.string(),
        type: z.enum(["info", "warning", "success"]),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            // TODO: Implement alert sending
            return [2 /*return*/, { success: true }];
        });
    }); }),
    // Get course lessons
    getLessons: protectedProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lessons, error_3;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getLessonsByCourse(input.courseId)];
                case 1:
                    lessons = _c.sent();
                    return [2 /*return*/, lessons];
                case 2:
                    error_3 = _c.sent();
                    console.error("Error getting lessons:", error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); }),
});
