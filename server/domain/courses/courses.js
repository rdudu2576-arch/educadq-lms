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
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
import { createCourse, getCourses, getCourseById, getCoursesByProfessor, updateCourse, getLessonsByCourse, getCourseEnrollments, getStudentEnrollments, enrollStudent, getEnrollmentStatus, createModule, createLesson, getModulesByCourse, getCourseBySlugOrId, getDb, } from "../../infra/db.js";
import { lessonMaterials } from "../../infra/schema.pg.js";
import { inArray } from "drizzle-orm";
import { z } from "zod";
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
var CreateCourseInput = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    coverUrl: z.string().url().optional(),
    trailerUrl: z.string().url().optional(),
    courseHours: z.number().min(1, "Course must have at least 1 hour"),
    price: z.string(),
    minimumGrade: z.number().default(70),
    maxInstallments: z.number().default(1),
    professorId: z.number().min(1, "Professor ID is required"),
    lessons: z
        .array(z.object({
        title: z.string().min(1),
        type: z.enum(["video", "text", "live", "material"]),
        content: z.string().optional(),
        videoUrl: z.string().url().optional(),
        liveUrl: z.string().url().optional(),
        order: z.number().min(0),
    }))
        .optional(),
});
var UpdateCourseInput = z.object({
    courseId: z.number().min(1),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    coverUrl: z.string().url().optional(),
    trailerUrl: z.string().url().optional(),
    courseHours: z.number().min(1).optional(),
    price: z.string().optional(),
    minimumGrade: z.number().optional(),
    maxInstallments: z.number().optional(),
});
var GetCoursesInput = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
});
var GetCourseByIdInput = z.object({
    courseId: z.number().min(1),
});
var GetCourseBySlugInput = z.object({
    slug: z.string().min(1),
});
var GetCourseByProfessorInput = z.object({
    professorId: z.number().min(1),
});
var EnrollInput = z.object({
    courseId: z.number().min(1),
});
var GetEnrollmentsInput = z.object({
    courseId: z.number().min(1),
});
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function canManageCourse(userRole, userId, professorId) {
    return userRole === "admin" || userId === professorId;
}
function buildCourseResponse(courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var lessons, modules;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getLessonsByCourse(courseId)];
                case 1:
                    lessons = _a.sent();
                    return [4 /*yield*/, getModulesByCourse(courseId)];
                case 2:
                    modules = _a.sent();
                    return [2 /*return*/, { lessons: lessons, modules: modules, materials: [] }];
            }
        });
    });
}
// ============================================================================
// ROUTER
// ============================================================================
export var coursesRouter = router({
    getAll: publicProcedure
        .input(GetCoursesInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCourses(input.limit, input.offset)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getFreeCourses: publicProcedure
        .input(GetCoursesInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var allCourses, freeCourses;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCourses()];
                case 1:
                    allCourses = _c.sent();
                    freeCourses = allCourses.filter(function (course) { return parseFloat(course.price.toString()) === 0; });
                    return [2 /*return*/, freeCourses.slice(input.offset, input.offset + input.limit)];
            }
        });
    }); }),
    getBySlug: publicProcedure
        .input(GetCourseBySlugInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var course, courseData;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCourseBySlugOrId(input.slug)];
                case 1:
                    course = _c.sent();
                    if (!course) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Course not found",
                        });
                    }
                    return [4 /*yield*/, buildCourseResponse(course.id)];
                case 2:
                    courseData = _c.sent();
                    return [2 /*return*/, __assign(__assign({}, course), courseData)];
            }
        });
    }); }),
    getById: publicProcedure
        .input(GetCourseByIdInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var course, courseData;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCourseById(input.courseId)];
                case 1:
                    course = _c.sent();
                    if (!course) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Course not found",
                        });
                    }
                    return [4 /*yield*/, buildCourseResponse(input.courseId)];
                case 2:
                    courseData = _c.sent();
                    return [2 /*return*/, __assign(__assign({}, course), courseData)];
            }
        });
    }); }),
    getByProfessor: protectedProcedure
        .input(GetCourseByProfessorInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, input.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You can only view your own courses",
                        });
                    }
                    return [4 /*yield*/, getCoursesByProfessor(input.professorId)];
                case 1: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    create: protectedProcedure
        .input(CreateCourseInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var courseResult, courseId, moduleResult, moduleId, _i, _c, lesson;
        var _d, _e, _f, _g;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.role) !== "admin" && ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.role) !== "professor") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Only admins and professors can create courses",
                        });
                    }
                    if (((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.role) === "professor" && ((_g = ctx.user) === null || _g === void 0 ? void 0 : _g.id) !== input.professorId) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Professors can only create courses for themselves",
                        });
                    }
                    return [4 /*yield*/, createCourse({
                            title: input.title,
                            description: input.description,
                            coverUrl: input.coverUrl,
                            trailerUrl: input.trailerUrl,
                            courseHours: input.courseHours,
                            price: input.price,
                            minimumGrade: input.minimumGrade,
                            maxInstallments: input.maxInstallments,
                            professorId: input.professorId,
                        })];
                case 1:
                    courseResult = _h.sent();
                    if (!courseResult) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Failed to create course",
                        });
                    }
                    courseId = courseResult.id;
                    return [4 /*yield*/, createModule({
                            courseId: courseId,
                            title: "Main Module",
                            description: "Default course module",
                            order: 0,
                        })];
                case 2:
                    moduleResult = _h.sent();
                    if (!(moduleResult && input.lessons && input.lessons.length > 0)) return [3 /*break*/, 6];
                    moduleId = moduleResult.id;
                    _i = 0, _c = input.lessons;
                    _h.label = 3;
                case 3:
                    if (!(_i < _c.length)) return [3 /*break*/, 6];
                    lesson = _c[_i];
                    return [4 /*yield*/, createLesson({
                            moduleId: moduleId,
                            title: lesson.title,
                            type: lesson.type,
                            content: lesson.content,
                            videoUrl: lesson.videoUrl,
                            liveUrl: lesson.liveUrl,
                            order: lesson.order,
                        })];
                case 4:
                    _h.sent();
                    _h.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, { courseId: courseId }];
            }
        });
    }); }),
    update: protectedProcedure
        .input(UpdateCourseInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var course, courseId, updateData;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getCourseById(input.courseId)];
                case 1:
                    course = _e.sent();
                    if (!course) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Course not found",
                        });
                    }
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to update this course",
                        });
                    }
                    courseId = input.courseId, updateData = __rest(input, ["courseId"]);
                    return [4 /*yield*/, updateCourse(courseId, updateData)];
                case 2: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    enroll: protectedProcedure
        .input(EnrollInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var course, existing;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCourseById(input.courseId)];
                case 1:
                    course = _c.sent();
                    if (!course) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Course not found",
                        });
                    }
                    return [4 /*yield*/, getEnrollmentStatus(ctx.user.id, input.courseId)];
                case 2:
                    existing = _c.sent();
                    if (existing) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "You are already enrolled in this course",
                        });
                    }
                    return [4 /*yield*/, enrollStudent(ctx.user.id, input.courseId)];
                case 3: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getStudentCourses: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getStudentEnrollments(ctx.user.id)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getEnrollments: protectedProcedure
        .input(GetEnrollmentsInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var course;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getCourseById(input.courseId)];
                case 1:
                    course = _e.sent();
                    if (!course) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Course not found",
                        });
                    }
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to view enrollments",
                        });
                    }
                    return [4 /*yield*/, getCourseEnrollments(input.courseId)];
                case 2: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    list: publicProcedure
        .input(GetCoursesInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCourses(input.limit, input.offset)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getCourseMaterials: publicProcedure
        .input(z.object({ courseId: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, lessons, lessonIds;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, getLessonsByCourse(input.courseId)];
                case 2:
                    lessons = _c.sent();
                    lessonIds = lessons.map(function (l) { return l.id; });
                    if (lessonIds.length === 0)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db
                            .select()
                            .from(lessonMaterials)
                            .where(inArray(lessonMaterials.lessonId, lessonIds))];
                case 3: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
});
