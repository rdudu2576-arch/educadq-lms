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
import { users } from "../infra/schema.pg.js";
import { eq } from "drizzle-orm";
/**
 * Achievement types and their point values
 */
export var ACHIEVEMENTS = {
    FIRST_COURSE: {
        id: "first_course",
        name: "Primeiro Passo",
        description: "Complete seu primeiro curso",
        icon: "🎓",
        points: 10,
    },
    PERFECT_SCORE: {
        id: "perfect_score",
        name: "Perfeição",
        description: "Obtenha nota 10 em uma avaliação",
        icon: "⭐",
        points: 50,
    },
    FIVE_COURSES: {
        id: "five_courses",
        name: "Aprendiz Dedicado",
        description: "Complete 5 cursos",
        icon: "📚",
        points: 100,
    },
    TEN_COURSES: {
        id: "ten_courses",
        name: "Mestre Estudioso",
        description: "Complete 10 cursos",
        icon: "🏆",
        points: 250,
    },
    STREAK_WEEK: {
        id: "streak_week",
        name: "Consistência",
        description: "Estude 7 dias seguidos",
        icon: "🔥",
        points: 75,
    },
    EARLY_BIRD: {
        id: "early_bird",
        name: "Madrugador",
        description: "Complete uma aula antes das 6am",
        icon: "🌅",
        points: 25,
    },
};
/**
 * Point values for different actions
 */
export var POINT_VALUES = {
    LESSON_COMPLETED: 5,
    ASSESSMENT_PASSED: 10,
    ASSESSMENT_PERFECT: 25,
    COURSE_COMPLETED: 50,
    COMMENT_POSTED: 2,
    MATERIAL_DOWNLOADED: 1,
};
/**
 * Award points to a user for an action
 */
export function awardPoints(userId_1, action_1) {
    return __awaiter(this, arguments, void 0, function (userId, action, multiplier) {
        var database, points, user, currentPoints, newPoints;
        if (multiplier === void 0) { multiplier = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    points = POINT_VALUES[action] * multiplier;
                    return [4 /*yield*/, database
                            .select()
                            .from(users)
                            .where(eq(users.id, userId))
                            .then(function (rows) { return rows[0]; })];
                case 2:
                    user = _a.sent();
                    if (!user)
                        throw new Error("User not found");
                    currentPoints = user.points || 0;
                    newPoints = currentPoints + points;
                    // In production, update user points in a separate points table
                    // For now, we'll just return the calculated points
                    // await database.update(users).set({ points: newPoints} as any).where(eq(users.id, userId));
                    return [2 /*return*/, newPoints];
            }
        });
    });
}
/**
 * Check if user has earned an achievement
 */
export function checkAndAwardAchievement(userId_1, achievementId_1) {
    return __awaiter(this, arguments, void 0, function (userId, achievementId, metadata) {
        var database, achievement, user;
        if (metadata === void 0) { metadata = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    achievement = Object.values(ACHIEVEMENTS).find(function (a) { return a.id === achievementId; });
                    if (!achievement)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, database
                            .select()
                            .from(users)
                            .where(eq(users.id, userId))
                            .then(function (rows) { return rows[0]; })];
                case 2:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, false];
                    // Check if user already has this achievement
                    // In production, query from user_achievements table
                    // For now, we'll just award points
                    // Award achievement points
                    // In production, update user points in a separate points table
                    // const newPoints = (user.points || 0) + achievement.points;
                    // await database.update(users).set({ points: newPoints} as any).where(eq(users.id, userId));
                    return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Get user's current level based on points
 */
export function getUserLevel(points) {
    var levels = [
        { level: 1, name: "Iniciante", minPoints: 0 },
        { level: 2, name: "Aprendiz", minPoints: 100 },
        { level: 3, name: "Estudioso", minPoints: 250 },
        { level: 4, name: "Especialista", minPoints: 500 },
        { level: 5, name: "Mestre", minPoints: 1000 },
        { level: 6, name: "Lenda", minPoints: 2000 },
    ];
    var currentLevel = levels[0];
    for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
        var level = levels_1[_i];
        if (points >= level.minPoints) {
            currentLevel = level;
        }
    }
    var nextLevel = levels.find(function (l) { return l.minPoints > currentLevel.minPoints; });
    var nextLevelPoints = nextLevel ? nextLevel.minPoints : currentLevel.minPoints + 1000;
    return {
        level: currentLevel.level,
        name: currentLevel.name,
        nextLevelPoints: nextLevelPoints,
    };
}
/**
 * Get user's progress to next level
 */
export function getLevelProgress(points) {
    var currentLevel = getUserLevel(points);
    var levels = [
        { level: 1, minPoints: 0 },
        { level: 2, minPoints: 100 },
        { level: 3, minPoints: 250 },
        { level: 4, minPoints: 500 },
        { level: 5, minPoints: 1000 },
        { level: 6, minPoints: 2000 },
    ];
    var currentLevelObj = levels.find(function (l) { return l.level === currentLevel.level; });
    var nextLevelObj = levels.find(function (l) { return l.level === currentLevel.level + 1; });
    if (!currentLevelObj || !nextLevelObj) {
        return { current: points, next: points, percentage: 100 };
    }
    var pointsInLevel = points - currentLevelObj.minPoints;
    var pointsNeeded = nextLevelObj.minPoints - currentLevelObj.minPoints;
    var percentage = Math.round((pointsInLevel / pointsNeeded) * 100);
    return {
        current: pointsInLevel,
        next: pointsNeeded,
        percentage: Math.min(percentage, 100),
    };
}
