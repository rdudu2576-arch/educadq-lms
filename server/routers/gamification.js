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
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc.js";
import { awardPoints, checkAndAwardAchievement, getUserLevel, getLevelProgress, ACHIEVEMENTS } from "../services/gamificationService.js";
import { getDb } from "../infra/db.js";
import { users } from "../infra/schema.pg.js";
import { eq } from "drizzle-orm";
export var gamificationRouter = router({
    /**
     * Get user's current points and level
     */
    getUserStats: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, userRows, user, points, level, progress;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, database
                            .select()
                            .from(users)
                            .where(eq(users.id, ctx.user.id))
                            .limit(1)];
                case 2:
                    userRows = _c.sent();
                    user = userRows[0];
                    if (!user)
                        throw new Error("User not found");
                    points = Math.floor(Math.random() * 5000);
                    level = getUserLevel(points);
                    progress = getLevelProgress(points);
                    return [2 /*return*/, {
                            userId: ctx.user.id,
                            points: points,
                            level: level.level,
                            levelName: level.name,
                            nextLevelPoints: level.nextLevelPoints,
                            progress: {
                                current: progress.current,
                                next: progress.next,
                                percentage: progress.percentage,
                            },
                        }];
            }
        });
    }); }),
    /**
     * Get global leaderboard
     */
    getLeaderboard: publicProcedure
        .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var database, allUsers, usersWithPoints, leaderboard, ranked;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _c.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, database
                            .select()
                            .from(users)];
                case 2:
                    allUsers = _c.sent();
                    usersWithPoints = allUsers.map(function (user) { return ({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        points: Math.floor(Math.random() * 5000),
                    }); });
                    // Sort by points descending
                    usersWithPoints.sort(function (a, b) { return b.points - a.points; });
                    leaderboard = usersWithPoints.slice(input.offset, input.offset + input.limit);
                    ranked = leaderboard.map(function (user, index) { return (__assign(__assign({}, user), { rank: input.offset + index + 1, level: getUserLevel(user.points).level, levelName: getUserLevel(user.points).name })); });
                    return [2 /*return*/, {
                            leaderboard: ranked,
                            total: usersWithPoints.length,
                            offset: input.offset,
                            limit: input.limit,
                        }];
            }
        });
    }); }),
    /**
     * Get user's achievements
     */
    getUserAchievements: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var achievements;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            achievements = Object.values(ACHIEVEMENTS).map(function (achievement) { return ({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points,
                earned: Math.random() > 0.5, // Mock earned status
                earnedAt: new Date(),
            }); });
            return [2 /*return*/, achievements];
        });
    }); }),
    /**
     * Award points for an action
     */
    awardPointsForAction: protectedProcedure
        .input(z.object({
        action: z.enum([
            "LESSON_COMPLETED",
            "ASSESSMENT_PASSED",
            "ASSESSMENT_PERFECT",
            "COURSE_COMPLETED",
            "COMMENT_POSTED",
            "MATERIAL_DOWNLOADED",
        ]),
        multiplier: z.number().min(1).max(10).default(1),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newPoints, error_1;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, awardPoints(ctx.user.id, input.action, input.multiplier)];
                case 1:
                    newPoints = _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            newPoints: newPoints,
                            level: getUserLevel(newPoints),
                        }];
                case 2:
                    error_1 = _c.sent();
                    throw new Error("Failed to award points");
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Check and award achievement
     */
    checkAchievement: protectedProcedure
        .input(z.object({
        achievementId: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var awarded, error_2;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, checkAndAwardAchievement(ctx.user.id, input.achievementId)];
                case 1:
                    awarded = _c.sent();
                    return [2 /*return*/, {
                            success: awarded,
                            achievement: ACHIEVEMENTS[input.achievementId] || null,
                        }];
                case 2:
                    error_2 = _c.sent();
                    throw new Error("Failed to check achievement");
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Get top achievements
     */
    getTopAchievements: publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Object.values(ACHIEVEMENTS).sort(function (a, b) { return b.points - a.points; })];
        });
    }); }),
});
