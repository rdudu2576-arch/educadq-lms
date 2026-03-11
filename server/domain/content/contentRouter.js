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
import { publicProcedure, adminProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { dynamicContent } from "../../infra/schema.pg.js";
import { eq } from "drizzle-orm";
import { getDb } from "../../infra/db.js";
export var contentRouter = router({
    // Get content by key (public)
    getContent: publicProcedure
        .input(z.object({ key: z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
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
                            .from(dynamicContent)
                            .where(eq(dynamicContent.key, input.key))];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result.length ? result[0] : null];
            }
        });
    }); }),
    // Get all content (admin only)
    getAllContent: adminProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        var db, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, db.select().from(dynamicContent)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    }); }),
    // Create content (admin only)
    createContent: adminProcedure
        .input(z.object({
        key: z.string(),
        title: z.string(),
        content: z.string(),
        contentType: z.enum(["html", "text", "markdown"]).default("html"),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, result;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, db.insert(dynamicContent).values({
                            key: input.key,
                            title: input.title,
                            content: input.content,
                            contentType: input.contentType,
                        }).returning()];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Update content (admin only)
    updateContent: adminProcedure
        .input(z.object({
        key: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        contentType: z.enum(["html", "text", "markdown"]).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db, key, data, result;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    key = input.key, data = __rest(input, ["key"]);
                    return [4 /*yield*/, db
                            .update(dynamicContent)
                            .set(data)
                            .where(eq(dynamicContent.key, key)).returning()];
                case 2:
                    result = _c.sent();
                    return [2 /*return*/, result[0]];
            }
        });
    }); }),
    // Delete content (admin only)
    deleteContent: adminProcedure
        .input(z.object({ key: z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var db;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _c.sent();
                    if (!db)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, db
                            .delete(dynamicContent)
                            .where(eq(dynamicContent.key, input.key))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
});
