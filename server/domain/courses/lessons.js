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
import { protectedProcedure, router } from "../../_core/trpc.js";
import { createLesson, getLessonsByCourse, getLessonsByModule, getLessonById, updateLesson, deleteLesson, getCourseById, getModuleById, createLessonMaterial, getMaterialsByLesson, deleteLessonMaterial, createModule, getModulesByCourse, updateModule, deleteModule, } from "../../infra/db.js";
import { z } from "zod";
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
var ModuleInput = z.object({
    courseId: z.number().min(1),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    order: z.coerce.number().min(0).default(0),
});
var UpdateModuleInput = z.object({
    moduleId: z.number().min(1),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().min(0).optional(),
});
var DeleteModuleInput = z.object({
    moduleId: z.number().min(1),
});
var GetModulesByCourseInput = z.object({
    courseId: z.number().min(1),
});
var LessonInput = z.object({
    moduleId: z.coerce.number().min(1),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["video", "text", "live", "material"]),
    content: z.string().optional(),
    videoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    order: z.coerce.number().min(0).default(0),
    durationMinutes: z.coerce.number().min(0).optional(),
});
var UpdateLessonInput = z.object({
    lessonId: z.number().min(1),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.enum(["video", "text", "live", "material"]).optional(),
    content: z.string().optional(),
    videoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    order: z.number().min(0).optional(),
    durationMinutes: z.coerce.number().min(0).optional(),
});
var DeleteLessonInput = z.object({
    lessonId: z.number().min(1),
});
var GetLessonByIdInput = z.number();
var GetLessonsByModuleInput = z.object({
    moduleId: z.number().min(1),
});
var GetLessonsByCoursInput = z.object({
    courseId: z.number().min(1),
});
var MaterialInput = z.object({
    lessonId: z.number().min(1),
    title: z.string().min(1, "Title is required"),
    type: z.enum(["pdf", "document", "spreadsheet", "video", "link"]).default("link"),
    url: z.string().url("Invalid URL"),
    fileSize: z.number().min(0).optional(),
});
var DeleteMaterialInput = z.object({
    materialId: z.number().min(1),
});
var GetMaterialsInput = z.object({
    lessonId: z.number().min(1),
});
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function canManageCourse(userRole, userId, professorId) {
    if (!userRole || !userId)
        return false;
    return userRole === "admin" || userId === professorId;
}
function buildLessonResponse(lessonId) {
    return __awaiter(this, void 0, void 0, function () {
        var materials;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getMaterialsByLesson(lessonId)];
                case 1:
                    materials = _a.sent();
                    return [2 /*return*/, { materials: materials }];
            }
        });
    });
}
// ============================================================================
// ROUTER
// ============================================================================
export var lessonsRouter = router({
    getModulesByCourse: protectedProcedure
        .input(GetModulesByCourseInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getModulesByCourse(input.courseId)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    createModule: protectedProcedure
        .input(ModuleInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
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
                            message: "You don't have permission to create modules in this course",
                        });
                    }
                    return [4 /*yield*/, createModule({
                            courseId: input.courseId,
                            title: input.title,
                            description: input.description,
                            order: input.order,
                        })];
                case 2: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    updateModule: protectedProcedure
        .input(UpdateModuleInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var module, course, moduleId, data;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getModuleById(input.moduleId)];
                case 1:
                    module = _e.sent();
                    if (!module) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Module not found",
                        });
                    }
                    return [4 /*yield*/, getCourseById(module.courseId)];
                case 2:
                    course = _e.sent();
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to update this module",
                        });
                    }
                    moduleId = input.moduleId, data = __rest(input, ["moduleId"]);
                    return [4 /*yield*/, updateModule(moduleId, data)];
                case 3: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    deleteModule: protectedProcedure
        .input(DeleteModuleInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var module, course;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getModuleById(input.moduleId)];
                case 1:
                    module = _e.sent();
                    if (!module) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Module not found",
                        });
                    }
                    return [4 /*yield*/, getCourseById(module.courseId)];
                case 2:
                    course = _e.sent();
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to delete this module",
                        });
                    }
                    return [4 /*yield*/, deleteModule(input.moduleId)];
                case 3: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    getByCourse: protectedProcedure
        .input(GetLessonsByCoursInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getLessonsByCourse(input.courseId)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getByModule: protectedProcedure
        .input(GetLessonsByModuleInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getLessonsByModule(input.moduleId)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getById: protectedProcedure
        .input(GetLessonByIdInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lesson, lessonData;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getLessonById(input)];
                case 1:
                    lesson = _c.sent();
                    if (!lesson) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Lesson not found",
                        });
                    }
                    return [4 /*yield*/, buildLessonResponse(input)];
                case 2:
                    lessonData = _c.sent();
                    return [2 /*return*/, __assign(__assign({}, lesson), lessonData)];
            }
        });
    }); }),
    create: protectedProcedure
        .input(LessonInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var module, course;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getModuleById(input.moduleId)];
                case 1:
                    module = _e.sent();
                    if (!module) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Module not found",
                        });
                    }
                    return [4 /*yield*/, getCourseById(module.courseId)];
                case 2:
                    course = _e.sent();
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to create lessons in this course",
                        });
                    }
                    return [4 /*yield*/, createLesson({
                            moduleId: input.moduleId,
                            title: input.title,
                            description: input.description,
                            type: input.type,
                            content: input.content,
                            videoUrl: input.videoUrl,
                            liveUrl: input.liveUrl,
                            order: input.order,
                            durationMinutes: input.durationMinutes,
                        })];
                case 3: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    update: protectedProcedure
        .input(UpdateLessonInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lesson, module, course, lessonId, data;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getLessonById(input.lessonId)];
                case 1:
                    lesson = _e.sent();
                    if (!lesson) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Lesson not found",
                        });
                    }
                    return [4 /*yield*/, getModuleById(lesson.moduleId)];
                case 2:
                    module = _e.sent();
                    if (!module) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Module not found",
                        });
                    }
                    return [4 /*yield*/, getCourseById(module.courseId)];
                case 3:
                    course = _e.sent();
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to update this lesson",
                        });
                    }
                    lessonId = input.lessonId, data = __rest(input, ["lessonId"]);
                    return [4 /*yield*/, updateLesson(lessonId, __assign(__assign({}, data), { type: data.type }))];
                case 4: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    delete: protectedProcedure
        .input(DeleteLessonInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lesson, module, course;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getLessonById(input.lessonId)];
                case 1:
                    lesson = _e.sent();
                    if (!lesson) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Lesson not found",
                        });
                    }
                    return [4 /*yield*/, getModuleById(lesson.moduleId)];
                case 2:
                    module = _e.sent();
                    if (!module) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Module not found",
                        });
                    }
                    return [4 /*yield*/, getCourseById(module.courseId)];
                case 3:
                    course = _e.sent();
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to delete this lesson",
                        });
                    }
                    return [4 /*yield*/, deleteLesson(input.lessonId)];
                case 4: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    addMaterial: protectedProcedure
        .input(MaterialInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var lesson, module, course;
        var _c, _d;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getLessonById(input.lessonId)];
                case 1:
                    lesson = _e.sent();
                    if (!lesson) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Lesson not found",
                        });
                    }
                    return [4 /*yield*/, getModuleById(lesson.moduleId)];
                case 2:
                    module = _e.sent();
                    if (!module) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Module not found",
                        });
                    }
                    return [4 /*yield*/, getCourseById(module.courseId)];
                case 3:
                    course = _e.sent();
                    if (!canManageCourse((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role, (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.id, course === null || course === void 0 ? void 0 : course.professorId)) {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "You don't have permission to add materials to this lesson",
                        });
                    }
                    return [4 /*yield*/, createLessonMaterial(__assign(__assign({}, input), { type: input.type }))];
                case 4: return [2 /*return*/, _e.sent()];
            }
        });
    }); }),
    removeMaterial: protectedProcedure
        .input(DeleteMaterialInput)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!ctx.user) {
                        throw new TRPCError({
                            code: "UNAUTHORIZED",
                            message: "You must be logged in",
                        });
                    }
                    return [4 /*yield*/, deleteLessonMaterial(input.materialId)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getMaterials: protectedProcedure
        .input(GetMaterialsInput)
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getMaterialsByLesson(input.lessonId)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
});
