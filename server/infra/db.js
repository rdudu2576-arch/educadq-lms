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
import { eq, and, desc, asc, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users, courses, modules, lessons, lessonMaterials, enrollments, lessonProgress, assessments, questionOptions, studentAnswers, assessmentResults, payments, certificates, articles, studentProfiles, subscriptionPayments, auditLogs, fraudDetection, integrityChecks, pageContent, } from "./schema.pg.js";
var Pool = pg.Pool;
var _db = null;
var _pool = null;
export function getDb() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!_db && process.env.DATABASE_URL) {
                try {
                    _pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: {
                            rejectUnauthorized: false
                        }
                    });
                    _db = drizzle(_pool);
                    console.log("[Database] Persistent PostgreSQL connection pool initialized");
                }
                catch (error) {
                    console.warn("[Database] Failed to connect:", error);
                    _db = null;
                }
            }
            return [2 /*return*/, _db];
        });
    });
}
// ============================================================================
// USERS
// ============================================================================
export function upsertUser(user) {
    return __awaiter(this, void 0, void 0, function () {
        var db, values;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user.openId)
                        throw new Error("User openId is required");
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    values = __assign({}, user);
                    return [4 /*yield*/, db.insert(users).values(values).onConflictDoUpdate({
                            target: users.openId,
                            set: values
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function getUserByOpenId(openId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, undefined];
                    return [4 /*yield*/, db.select().from(users).where(eq(users.openId, openId)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : undefined];
            }
        });
    });
}
export function getUserById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, undefined];
                    return [4 /*yield*/, db.select().from(users).where(eq(users.id, id)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : undefined];
            }
        });
    });
}
export function getAllUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(users).orderBy(desc(users.createdAt))];
            }
        });
    });
}
export function updateUserRole(userId, role) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(users).set({ role: role }).where(eq(users.id, userId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getUserById(userId)];
            }
        });
    });
}
export function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!email)
                        return [2 /*return*/, undefined];
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, undefined];
                    return [4 /*yield*/, db.select().from(users).where(eq(users.email, email)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : undefined];
            }
        });
    });
}
export function createUser(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, openId, values, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        throw new Error("Database not connected");
                    openId = "local_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    values = {
                        email: data.email,
                        password: data.password,
                        name: data.name,
                        role: data.role,
                        openId: openId,
                    };
                    if (data.additionalData) {
                        values.cpf = data.additionalData.cpf;
                        values.phone = data.additionalData.phone;
                        values.address = data.additionalData.address;
                        values.city = data.additionalData.city;
                        values.state = data.additionalData.state;
                        values.zip = data.additionalData.cep;
                        values.rg = data.additionalData.rg;
                        values.age = parseInt(data.additionalData.age);
                        values.neighborhood = data.additionalData.neighborhood;
                        values.complement = data.additionalData.complement;
                        values.number = data.additionalData.number;
                    }
                    return [4 /*yield*/, db.insert(users).values(values).returning()];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    });
}
export function updateUser(userId, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(users).set(data).where(eq(users.id, userId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getUserById(userId)];
            }
        });
    });
}
// ============================================================================
// COURSES
// ============================================================================
export function createCourse(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(courses).values({
                            title: data.title,
                            description: data.description,
                            coverUrl: data.coverUrl,
                            trailerUrl: data.trailerUrl,
                            courseHours: data.courseHours,
                            price: data.price,
                            minimumGrade: (_a = data.minimumGrade) !== null && _a !== void 0 ? _a : 70,
                            maxInstallments: (_b = data.maxInstallments) !== null && _b !== void 0 ? _b : 1,
                            professorId: data.professorId,
                        }).returning()];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    });
}
export function getCourses() {
    return __awaiter(this, arguments, void 0, function (limit, offset) {
        var db;
        if (limit === void 0) { limit = 50; }
        if (offset === void 0) { offset = 0; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(courses).where(eq(courses.isActive, true)).orderBy(desc(courses.createdAt)).limit(limit).offset(offset)];
            }
        });
    });
}
export function getAllCourses() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(courses).orderBy(desc(courses.createdAt))];
            }
        });
    });
}
export function getCourseById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(courses).where(eq(courses.id, id)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getCoursesByProfessor(professorId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(courses).where(eq(courses.professorId, professorId))];
            }
        });
    });
}
export function updateCourse(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(courses).set(data).where(eq(courses.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getCourseById(id)];
            }
        });
    });
}
export function deleteCourse(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, db.update(courses).set({ isActive: false }).where(eq(courses.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// MODULES
// ============================================================================
export function createModule(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, db.insert(modules).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getModulesByCourse(courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(asc(modules.order))];
            }
        });
    });
}
export function getModuleById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(modules).where(eq(modules.id, id)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function updateModule(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(modules).set(data).where(eq(modules.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getModuleById(id)];
            }
        });
    });
}
export function deleteModule(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, db.delete(modules).where(eq(modules.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// LESSONS
// ============================================================================
export function createLesson(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, order, lastLesson, lessonData, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    order = data.order;
                    if (!(!order || order === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.select().from(lessons)
                            .where(eq(lessons.moduleId, data.moduleId))
                            .orderBy(desc(lessons.order))
                            .limit(1)];
                case 2:
                    lastLesson = _b.sent();
                    order = lastLesson.length ? lastLesson[0].order + 1 : 1;
                    _b.label = 3;
                case 3:
                    lessonData = __assign(__assign({}, data), { order: order });
                    return [4 /*yield*/, db.insert(lessons).values(lessonData).returning()];
                case 4:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getLessonsByModule(moduleId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(asc(lessons.order))];
            }
        });
    });
}
export function getLessonById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(lessons).where(eq(lessons.id, id)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function updateLesson(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(lessons).set(data).where(eq(lessons.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getLessonById(id)];
            }
        });
    });
}
export function deleteLesson(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, db.delete(lessons).where(eq(lessons.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function getLessonsByCourse(courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, courseModules, moduleIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, getModulesByCourse(courseId)];
                case 2:
                    courseModules = _a.sent();
                    if (courseModules.length === 0)
                        return [2 /*return*/, []];
                    moduleIds = courseModules.map(function (m) { return m.id; });
                    return [2 /*return*/, db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).orderBy(asc(lessons.order))];
            }
        });
    });
}
// ============================================================================
// ARTICLES
// ============================================================================
export function getArticles() {
    return __awaiter(this, arguments, void 0, function (limit, offset) {
        var db;
        if (limit === void 0) { limit = 50; }
        if (offset === void 0) { offset = 0; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt)).limit(limit).offset(offset)];
            }
        });
    });
}
export function getAllArticles() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(articles).orderBy(desc(articles.createdAt))];
            }
        });
    });
}
// ============================================================================
// ENROLLMENTS
// ============================================================================
export function enrollStudent(studentId, courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(enrollments).values({
                            studentId: studentId,
                            courseId: courseId,
                            status: "active",
                            enrolledAt: new Date(),
                        }).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getEnrollmentStatus(studentId, courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(enrollments).where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId))).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getCourseBySlugOrId(slugOrId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    if (typeof slugOrId === "number") {
                        return [2 /*return*/, getCourseById(slugOrId)];
                    }
                    return [4 /*yield*/, db.select().from(courses).where(eq(courses.slug, slugOrId)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
// ============================================================================
// LESSONS (MATERIALS)
// ============================================================================
export function createLessonMaterial(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(lessonMaterials).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getMaterialsByLesson(lessonId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(lessonMaterials).where(eq(lessonMaterials.lessonId, lessonId))];
            }
        });
    });
}
export function deleteLessonMaterial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, db.delete(lessonMaterials).where(eq(lessonMaterials.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// PROGRESS
// ============================================================================
export function recordLessonProgress(studentId, lessonId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(lessonProgress).values({
                            studentId: studentId,
                            lessonId: lessonId,
                            status: "completed",
                            completedAt: new Date(),
                        }).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getStudentLessonProgress(studentId, courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, lessons, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, getLessonsByCourse(courseId)];
                case 2:
                    lessons = _a.sent();
                    if (lessons.length === 0)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(lessonProgress).where(and(eq(lessonProgress.studentId, studentId), inArray(lessonProgress.lessonId, lessons.map(function (l) { return l.id; }))))];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
export function calculateCourseProgress(studentId, courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, lessons, completed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, 0];
                    return [4 /*yield*/, getLessonsByCourse(courseId)];
                case 2:
                    lessons = _a.sent();
                    if (lessons.length === 0)
                        return [2 /*return*/, 0];
                    return [4 /*yield*/, db.select().from(lessonProgress).where(and(eq(lessonProgress.studentId, studentId), inArray(lessonProgress.lessonId, lessons.map(function (l) { return l.id; })), eq(lessonProgress.status, "completed")))];
                case 3:
                    completed = _a.sent();
                    return [2 /*return*/, Math.round((completed.length / lessons.length) * 100)];
            }
        });
    });
}
export function getStudentAssessmentScore(studentId, assessmentId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(assessmentResults).where(and(eq(assessmentResults.studentId, studentId), eq(assessmentResults.assessmentId, assessmentId))).orderBy(desc(assessmentResults.createdAt)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function createCertificate(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(certificates).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getCertificateByCourse(studentId, courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(certificates).where(and(eq(certificates.studentId, studentId), eq(certificates.courseId, courseId))).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
// ============================================================================
// PAYMENTS
// ============================================================================
export function createPayment(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(payments).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getPaymentsByStudent(studentId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(payments).where(eq(payments.studentId, studentId)).orderBy(desc(payments.createdAt))];
            }
        });
    });
}
export function getPaymentsByCourse(courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(payments).where(eq(payments.courseId, courseId))];
            }
        });
    });
}
export function getAllPayments() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(payments).orderBy(desc(payments.createdAt))];
            }
        });
    });
}
export function updatePayment(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(payments).set(data).where(eq(payments.id, id))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, db.select().from(payments).where(eq(payments.id, id)).limit(1)];
                case 3:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getOverduePayments() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(payments).where(and(eq(payments.status, "overdue"), lte(payments.dueDate, new Date())))];
            }
        });
    });
}
// ============================================================================
// PROFESSIONALS / RANKING
// ============================================================================
export function getRanking() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var db;
        if (limit === void 0) { limit = 100; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(studentProfiles).where(eq(studentProfiles.isPublic, true)).orderBy(desc(studentProfiles.score)).limit(limit)];
            }
        });
    });
}
export function getOrCreateStudentProfile(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, profile, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1)];
                case 2:
                    profile = _b.sent();
                    if (profile.length > 0)
                        return [2 /*return*/, profile[0]];
                    return [4 /*yield*/, db.insert(studentProfiles).values({ userId: userId }).returning()];
                case 3:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function updateStudentProfile(userId, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(studentProfiles).set(data).where(eq(studentProfiles.userId, userId))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1)];
                case 3:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getActiveSubscription(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(subscriptionPayments).where(and(eq(subscriptionPayments.userId, userId), eq(subscriptionPayments.status, "completed"))).orderBy(desc(subscriptionPayments.createdAt)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getStudentProfile(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getSubscriptionHistory(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(subscriptionPayments).where(eq(subscriptionPayments.userId, userId)).orderBy(desc(subscriptionPayments.createdAt))];
            }
        });
    });
}
export function createSubscriptionPayment(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(subscriptionPayments).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function createAuditLog(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(auditLogs).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function activatePublicProfile(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(studentProfiles).set({ isPublic: true }).where(eq(studentProfiles.userId, userId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getStudentProfile(userId)];
            }
        });
    });
}
export function getFraudAlerts() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(fraudDetection).orderBy(desc(fraudDetection.createdAt))];
            }
        });
    });
}
export function getAuditLogs(params) {
    return __awaiter(this, void 0, void 0, function () {
        var db, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    query = db.select().from(auditLogs);
                    if (params.userId) {
                        query = query.where(eq(auditLogs.userId, params.userId));
                    }
                    return [2 /*return*/, query.orderBy(desc(auditLogs.createdAt)).limit(params.limit || 50).offset(params.offset || 0)];
            }
        });
    });
}
export function blockUserAccount(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(users).set({ role: "user" }).where(eq(users.id, userId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getUserById(userId)];
            }
        });
    });
}
export function resolveFraudAlert(id, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(fraudDetection).set({ resolved: true, resolvedBy: userId }).where(eq(fraudDetection.id, id))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, db.select().from(fraudDetection).where(eq(fraudDetection.id, id)).limit(1)];
                case 3:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getAllIntegrityChecks() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(integrityChecks).orderBy(desc(integrityChecks.createdAt))];
            }
        });
    });
}
// ============================================================================
// PAGE CONTENT
// ============================================================================
export function getPageContent(pageKey) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey))];
            }
        });
    });
}
export function getPageContentByKey(pageKey) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function updatePageContent(pageKey, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(pageContent).set(data).where(eq(pageContent.pageKey, pageKey))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getPageContentByKey(pageKey)];
            }
        });
    });
}
export function deletePageContent(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, db.delete(pageContent).where(eq(pageContent.id, parseInt(id)))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function getAllPageContent() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(pageContent)];
            }
        });
    });
}
// ============================================================================
// USER PROFILE
// ============================================================================
export function updateUserProfile(userId, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(users).set(data).where(eq(users.id, userId))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getUserById(userId)];
            }
        });
    });
}
// ============================================================================
// ARTICLES
// ============================================================================
export function getArticleBySlug(slug) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(articles).where(eq(articles.slug, slug)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getArticleById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(articles).where(eq(articles.id, id)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function createArticle(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(articles).values(data).returning()];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, (_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null];
            }
        });
    });
}
export function updateArticle(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.update(articles).set(data).where(eq(articles.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, getArticleById(id)];
            }
        });
    });
}
export function deleteArticle(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/];
                    return [4 /*yield*/, db.delete(articles).where(eq(articles.id, id))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// ENROLLMENTS / OTHERS
// ============================================================================
export function getCourseEnrollments(courseId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(enrollments).where(eq(enrollments.courseId, courseId))];
            }
        });
    });
}
export function getStudentEnrollments(studentId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(enrollments).where(eq(enrollments.studentId, studentId))];
            }
        });
    });
}
export function getAssessmentById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.select().from(assessments).where(eq(assessments.id, id)).limit(1)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function recordStudentAnswer(data) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _b.sent();
                    if (!db)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db.insert(studentAnswers).values(data).returning()];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, (_a = result[0]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
export function getOptionsByQuestion(questionId) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [2 /*return*/, db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId))];
            }
        });
    });
}
