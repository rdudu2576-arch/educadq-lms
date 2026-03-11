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
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
import { getPageContent, getPageContentByKey, updatePageContent, deletePageContent, getAllPageContent, } from "../../infra/db.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
export var pageContentRouter = router({
    // Get all content for a specific page (public)
    getByPage: publicProcedure
        .input(z.object({ pageKey: z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getPageContent(input.pageKey)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    // Get specific content by keys (public)
    getByKey: publicProcedure
        .input(z.object({
        pageKey: z.string(),
        sectionKey: z.string(),
        contentKey: z.string(),
    }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var content;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getPageContentByKey(input.pageKey)];
                case 1:
                    content = _c.sent();
                    if (!content) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: "Conteúdo não encontrado",
                        });
                    }
                    return [2 /*return*/, content];
            }
        });
    }); }),
    // Update content (admin only)
    update: protectedProcedure
        .input(z.object({
        pageKey: z.string(),
        sectionKey: z.string(),
        contentKey: z.string(),
        content: z.string(),
        contentType: z.enum(["text", "html", "markdown"]).default("text"),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var result;
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem editar conteúdo",
                        });
                    }
                    return [4 /*yield*/, updatePageContent(input.pageKey, {
                            sectionKey: input.sectionKey,
                            contentKey: input.contentKey,
                            content: input.content,
                            contentType: input.contentType,
                            updatedBy: ctx.user.id
                        })];
                case 1:
                    result = _d.sent();
                    return [2 /*return*/, { success: true, result: result }];
            }
        });
    }); }),
    // Delete content (admin only)
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem deletar conteúdo",
                        });
                    }
                    return [4 /*yield*/, deletePageContent(input.id.toString())];
                case 1:
                    _d.sent();
                    return [2 /*return*/, { success: true }];
            }
        });
    }); }),
    // Get all page content (admin only)
    getAll: protectedProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c;
        var ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin") {
                        throw new TRPCError({
                            code: "FORBIDDEN",
                            message: "Apenas administradores podem acessar todos os conteúdos",
                        });
                    }
                    return [4 /*yield*/, getAllPageContent()];
                case 1: return [2 /*return*/, _d.sent()];
            }
        });
    }); }),
});
