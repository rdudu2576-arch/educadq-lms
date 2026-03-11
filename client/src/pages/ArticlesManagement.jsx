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
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
export default function ArticlesManagement() {
    var _this = this;
    var _a = useState(false), isCreating = _a[0], setIsCreating = _a[1];
    var _b = useState(null), editingId = _b[0], setEditingId = _b[1];
    var _c = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        cover: "",
        isPublished: false,
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc.articles.listAll.useQuery(), articles = _d.data, isLoading = _d.isLoading, refetch = _d.refetch;
    var createMutation = trpc.articles.create.useMutation();
    var updateMutation = trpc.articles.update.useMutation();
    var deleteMutation = trpc.articles.delete.useMutation();
    var handleCreate = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.title || !formData.slug || !formData.content) {
                        toast.error("Preencha todos os campos obrigatórios");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createMutation.mutateAsync(formData)];
                case 2:
                    _a.sent();
                    toast.success("Artigo criado com sucesso!");
                    setFormData({
                        title: "",
                        slug: "",
                        content: "",
                        excerpt: "",
                        cover: "",
                        isPublished: false,
                    });
                    setIsCreating(false);
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    toast.error("Erro ao criar artigo");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editingId)
                        return [2 /*return*/];
                    if (!formData.title || !formData.slug || !formData.content) {
                        toast.error("Preencha todos os campos obrigatórios");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateMutation.mutateAsync(__assign({ id: editingId }, formData))];
                case 2:
                    _a.sent();
                    toast.success("Artigo atualizado com sucesso!");
                    setEditingId(null);
                    setFormData({
                        title: "",
                        slug: "",
                        content: "",
                        excerpt: "",
                        cover: "",
                        isPublished: false,
                    });
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    toast.error("Erro ao atualizar artigo");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Tem certeza que deseja deletar este artigo?"))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteMutation.mutateAsync({ id: id })];
                case 2:
                    _a.sent();
                    toast.success("Artigo deletado com sucesso!");
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    toast.error("Erro ao deletar artigo");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEdit = function (article) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setEditingId(article.id);
            setFormData({
                title: article.title,
                slug: article.slug,
                content: article.content,
                excerpt: article.excerpt || "",
                cover: article.cover || "",
                isPublished: article.isPublished || false,
            });
            return [2 /*return*/];
        });
    }); };
    var handleCancel = function () {
        setIsCreating(false);
        setEditingId(null);
        setFormData({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            cover: "",
            isPublished: false,
        });
    };
    if (isLoading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Form Section */}
      {(isCreating || editingId) && (<Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? "Editar Artigo" : "Novo Artigo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Título *</label>
              <Input value={formData.title} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { title: e.target.value }));
            }} placeholder="Título do artigo" className="bg-slate-700 border-slate-600 text-white"/>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Slug *</label>
              <Input value={formData.slug} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { slug: e.target.value }));
            }} placeholder="url-amigavel-do-artigo" className="bg-slate-700 border-slate-600 text-white"/>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Conteúdo *</label>
              <Textarea value={formData.content} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { content: e.target.value }));
            }} placeholder="Conteúdo do artigo (HTML ou Markdown)" rows={8} className="bg-slate-700 border-slate-600 text-white"/>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Resumo</label>
              <Input value={formData.excerpt} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { excerpt: e.target.value }));
            }} placeholder="Resumo do artigo (opcional)" className="bg-slate-700 border-slate-600 text-white"/>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">URL da Capa</label>
              <Input value={formData.cover} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { cover: e.target.value }));
            }} placeholder="https://exemplo.com/imagem.jpg" className="bg-slate-700 border-slate-600 text-white"/>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={formData.isPublished} onChange={function (e) {
                return setFormData(__assign(__assign({}, formData), { isPublished: e.target.checked }));
            }} className="w-4 h-4"/>
              <label htmlFor="published" className="text-sm text-slate-300">
                Publicado
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={editingId ? handleUpdate : handleCreate} disabled={createMutation.isPending || updateMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                {createMutation.isPending || updateMutation.isPending ? (<>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    Salvando...
                  </>) : (editingId ? "Atualizar" : "Criar")}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="border-slate-600 text-slate-300">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>)}

      {/* List Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Artigos</h3>
          {!isCreating && !editingId && (<Button onClick={function () { return setIsCreating(true); }} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2"/>
              Novo Artigo
            </Button>)}
        </div>

        {articles && articles.length > 0 ? (<div className="grid gap-4">
            {articles.map(function (article) { return (<Card key={article.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-semibold">{article.title}</h4>
                        <Badge variant={article.isPublished ? "default" : "secondary"} className={article.isPublished
                    ? "bg-green-600"
                    : "bg-slate-600"}>
                          {article.isPublished ? (<>
                              <Eye className="w-3 h-3 mr-1"/> Publicado
                            </>) : (<>
                              <EyeOff className="w-3 h-3 mr-1"/> Rascunho
                            </>)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Slug: <code className="bg-slate-700 px-2 py-1 rounded">{article.slug}</code>
                      </p>
                      <p className="text-sm text-slate-400">
                        Autor: {article.author} • Criado em{" "}
                        {new Date(article.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={function () { return handleEdit(article); }} size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        <Edit2 className="w-4 h-4"/>
                      </Button>
                      <Button onClick={function () { return handleDelete(article.id); }} size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10" disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? (<Loader2 className="w-4 h-4 animate-spin"/>) : (<Trash2 className="w-4 h-4"/>)}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>); })}
          </div>) : (<Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400">Nenhum artigo criado ainda</p>
            </CardContent>
          </Card>)}
      </div>
    </div>);
}
