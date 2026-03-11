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
import { z } from "zod";
import * as db from "../../infra/db.js";
export var articlesRouter = router({
    list: publicProcedure.query(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db.getArticles()];
        });
    }); }),
    listAll: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c;
        var ctx = _b.ctx;
        return __generator(this, function (_d) {
            if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
            }
            return [2 /*return*/, db.getAllArticles()];
        });
    }); }),
    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var article;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db.getArticleBySlug(input.slug)];
                case 1:
                    article = _c.sent();
                    if (!article) {
                        throw new TRPCError({ code: "NOT_FOUND", message: "Artigo não encontrado" });
                    }
                    return [2 /*return*/, article];
            }
        });
    }); }),
    getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var article;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
                    }
                    return [4 /*yield*/, db.getArticleById(input.id)];
                case 1:
                    article = _d.sent();
                    if (!article) {
                        throw new TRPCError({ code: "NOT_FOUND", message: "Artigo não encontrado" });
                    }
                    return [2 /*return*/, article];
            }
        });
    }); }),
    create: protectedProcedure
        .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        cover: z.string().optional(),
        isPublished: z.boolean().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
                    }
                    return [4 /*yield*/, db.createArticle(__assign(__assign({}, input), { author: ctx.user.name || "Admin", authorId: ctx.user.id }))];
                case 1:
                    id = _d.sent();
                    return [2 /*return*/, { id: id }];
            }
        });
    }); }),
    update: protectedProcedure
        .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        cover: z.string().optional(),
        isPublished: z.boolean().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, data;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
                    }
                    id = input.id, data = __rest(input, ["id"]);
                    return [4 /*yield*/, db.updateArticle(id, data)];
                case 1:
                    _d.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores" });
                    }
                    return [4 /*yield*/, db.deleteArticle(input.id)];
                case 1:
                    _d.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
});
