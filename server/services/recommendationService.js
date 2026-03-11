/**
 * Course Recommendation Service
 */
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
import { getDb } from "../infra/db.js";
import { eq, and, not, inArray } from "drizzle-orm";
import { courses, enrollments } from "../infra/schema.pg.js";
export function getRecommendedCourses(studentId_1) {
    return __awaiter(this, arguments, void 0, function (studentId, limit) {
        var db, enrolledCourses, enrolledIds, allCourses, _a, scored, error_1;
        var _this = this;
        if (limit === void 0) { limit = 5; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 9, , 10]);
                    return [4 /*yield*/, db.select({ courseId: enrollments.courseId }).from(enrollments)
                            .where(eq(enrollments.studentId, studentId))];
                case 3:
                    enrolledCourses = _b.sent();
                    enrolledIds = enrolledCourses.map(function (e) { return e.courseId; });
                    if (!(enrolledIds.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, db.select().from(courses).where(and(eq(courses.isActive, true), not(inArray(courses.id, enrolledIds))))];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, db.select().from(courses).where(eq(courses.isActive, true))];
                case 6:
                    _a = _b.sent();
                    _b.label = 7;
                case 7:
                    allCourses = _a;
                    return [4 /*yield*/, Promise.all(allCourses.map(function (course) { return __awaiter(_this, void 0, void 0, function () {
                            var score, reasons, enrollCount, courseAge, val;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        score = 50;
                                        reasons = [];
                                        return [4 /*yield*/, db.select({ id: enrollments.id }).from(enrollments)
                                                .where(eq(enrollments.courseId, course.id))];
                                    case 1:
                                        enrollCount = _b.sent();
                                        if (enrollCount.length > 10) {
                                            score += 20;
                                            reasons.push("Popular");
                                        }
                                        courseAge = Date.now() - (((_a = course.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0);
                                        if (courseAge < 30 * 24 * 60 * 60 * 1000) {
                                            score += 10;
                                            reasons.push("Novo");
                                        }
                                        val = parseFloat(course.price.toString());
                                        if (val < 100) {
                                            score += 5;
                                            reasons.push("Acessivel");
                                        }
                                        return [2 /*return*/, {
                                                id: course.id, title: course.title, description: course.description || "",
                                                courseHours: course.courseHours, price: course.price.toString(),
                                                coverUrl: course.coverUrl || "", reason: reasons.join(", ") || "Recomendado",
                                                score: Math.min(100, score),
                                            }];
                                }
                            });
                        }); }))];
                case 8:
                    scored = _b.sent();
                    return [2 /*return*/, scored.sort(function (a, b) { return b.score - a.score; }).slice(0, limit)];
                case 9:
                    error_1 = _b.sent();
                    console.error("[Recommendation] Error:", error_1);
                    return [2 /*return*/, []];
                case 10: return [2 /*return*/];
            }
        });
    });
}
export function getTrendingCourses() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var db, allCourses, scored, error_2;
        var _this = this;
        if (limit === void 0) { limit = 5; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, db.select().from(courses).where(eq(courses.isActive, true))];
                case 3:
                    allCourses = _a.sent();
                    return [4 /*yield*/, Promise.all(allCourses.map(function (course) { return __awaiter(_this, void 0, void 0, function () {
                            var enrollCount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.select({ id: enrollments.id }).from(enrollments)
                                            .where(eq(enrollments.courseId, course.id))];
                                    case 1:
                                        enrollCount = _a.sent();
                                        return [2 /*return*/, {
                                                id: course.id, title: course.title, description: course.description || "",
                                                courseHours: course.courseHours, price: course.price.toString(),
                                                coverUrl: course.coverUrl || "", reason: "Tendencia",
                                                score: Math.min(100, enrollCount.length * 10),
                                            }];
                                }
                            });
                        }); }))];
                case 4:
                    scored = _a.sent();
                    return [2 /*return*/, scored.sort(function (a, b) { return b.score - a.score; }).slice(0, limit)];
                case 5:
                    error_2 = _a.sent();
                    console.error("[Trending] Error:", error_2);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
}
export function getSimilarCourses(courseId_1) {
    return __awaiter(this, arguments, void 0, function (courseId, limit) {
        var db, base_1, others, scored, error_3;
        if (limit === void 0) { limit = 5; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, db.select().from(courses).where(eq(courses.id, courseId)).limit(1)];
                case 3:
                    base_1 = _a.sent();
                    if (!base_1.length)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(courses).where(and(eq(courses.isActive, true), not(eq(courses.id, courseId))))];
                case 4:
                    others = _a.sent();
                    scored = others.map(function (course) {
                        var score = 50;
                        var priceDiff = Math.abs(parseFloat(base_1[0].price.toString()) - parseFloat(course.price.toString()));
                        if (priceDiff < 50)
                            score += 20;
                        var hourDiff = Math.abs(base_1[0].courseHours - course.courseHours);
                        if (hourDiff < 10)
                            score += 15;
                        return {
                            id: course.id, title: course.title, description: course.description || "",
                            courseHours: course.courseHours, price: course.price.toString(),
                            coverUrl: course.coverUrl || "", reason: "Similar",
                            score: Math.min(100, score),
                        };
                    });
                    return [2 /*return*/, scored.sort(function (a, b) { return b.score - a.score; }).slice(0, limit)];
                case 5:
                    error_3 = _a.sent();
                    console.error("[Similar] Error:", error_3);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
}
