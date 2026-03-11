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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Save, Trash2 } from "lucide-react";
export default function ContentEditor() {
    var _this = this;
    var user = useAuth().user;
    var _a = useState("home"), selectedPage = _a[0], setSelectedPage = _a[1];
    var _b = useState(null), editingContent = _b[0], setEditingContent = _b[1];
    var _c = useState({
        pageKey: selectedPage,
        sectionKey: "",
        contentKey: "",
        content: "",
    }), newContent = _c[0], setNewContent = _c[1];
    var _d = trpc.pageContent.getByPage.useQuery({ pageKey: selectedPage }), pageContent = _d.data, isLoading = _d.isLoading, refetch = _d.refetch;
    var updateMutation = trpc.pageContent.update.useMutation({
        onSuccess: function () {
            alert("Conteúdo atualizado com sucesso!");
            refetch();
            setEditingContent(null);
        },
        onError: function (error) {
            alert("Erro ao atualizar conteúdo: " + (error.message || "Erro desconhecido"));
        },
    });
    var deleteMutation = trpc.pageContent.delete.useMutation({
        onSuccess: function () {
            alert("Conteúdo deletado com sucesso!");
            refetch();
        },
        onError: function (error) {
            alert("Erro ao deletar conteúdo: " + (error.message || "Erro desconhecido"));
        },
    });
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editingContent) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateMutation.mutateAsync({
                            pageKey: editingContent.pageKey,
                            sectionKey: editingContent.sectionKey,
                            contentKey: editingContent.contentKey,
                            content: editingContent.content,
                            contentType: "text",
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Tem certeza que deseja deletar este conteúdo?")) return [3 /*break*/, 2];
                    return [4 /*yield*/, deleteMutation.mutateAsync({ id: id })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var pages = ["home", "sobre", "artigos", "contato"];
    if (!user || user.role !== "admin") {
        return (<div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
      </div>);
    }
    return (<div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Conteúdo das Páginas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Page Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pages.map(function (page) { return (<button key={page} onClick={function () {
                setSelectedPage(page);
                setEditingContent(null);
            }} className={"w-full text-left px-4 py-2 rounded-lg transition-colors ".concat(selectedPage === page
                ? "bg-teal-600 text-white"
                : "bg-slate-100 hover:bg-slate-200")}>
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>); })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Content List */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Página: {selectedPage}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (<div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600"/>
                </div>) : pageContent && pageContent.length > 0 ? (<div className="space-y-4">
                  {pageContent.map(function (item) { return (<div key={item.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {item.sectionKey} / {item.contentKey}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={function () { return setEditingContent(item); }}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={function () { return handleDelete(item.id); }} disabled={deleteMutation.isPending}>
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    </div>); })}
                </div>) : (<p className="text-slate-600 text-center py-8">
                  Nenhum conteúdo nesta página
                </p>)}
            </CardContent>
          </Card>

          {/* Edit Form */}
          {editingContent && (<Card className="border-teal-600 border-2">
              <CardHeader>
                <CardTitle>Editar Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seção
                  </label>
                  <Input value={editingContent.sectionKey} onChange={function (e) {
                return setEditingContent(__assign(__assign({}, editingContent), { sectionKey: e.target.value }));
            }} placeholder="Ex: hero, features, footer"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chave do Conteúdo
                  </label>
                  <Input value={editingContent.contentKey} onChange={function (e) {
                return setEditingContent(__assign(__assign({}, editingContent), { contentKey: e.target.value }));
            }} placeholder="Ex: title, description, cta_text"/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Conteúdo
                  </label>
                  <textarea value={editingContent.content} onChange={function (e) {
                return setEditingContent(__assign(__assign({}, editingContent), { content: e.target.value }));
            }} placeholder="Digite o conteúdo aqui..." rows={6} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"/>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex items-center gap-2">
                    {updateMutation.isPending && (<Loader2 className="w-4 h-4 animate-spin"/>)}
                    <Save className="w-4 h-4"/>
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={function () { return setEditingContent(null); }}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>);
}
