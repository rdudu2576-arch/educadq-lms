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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
export default function LessonEditor(_a) {
    var _this = this;
    var params = _a.params;
    var _b = useAuth(), user = _b.user, loading = _b.loading;
    var _c = useLocation(), setLocation = _c[1];
    var courseId = params.courseId ? parseInt(params.courseId) : 0;
    var lessonId = params.lessonId ? parseInt(params.lessonId) : null;
    var _d = useState({
        title: "",
        type: "text",
        content: "",
        videoUrl: "",
        liveUrl: "",
        order: 1,
    }), formData = _d[0], setFormData = _d[1];
    var _e = useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var createMutation = trpc.lessons.create.useMutation();
    var updateMutation = trpc.lessons.update.useMutation();
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    if (!user || user.role !== "professor") {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Acesso negado.</p>
      </div>);
    }
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!lessonId) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateMutation.mutateAsync({
                            lessonId: lessonId,
                            title: formData.title,
                            type: formData.type,
                            content: formData.type === "text" ? formData.content : undefined,
                            videoUrl: formData.type === "video" ? formData.videoUrl : undefined,
                            liveUrl: formData.type === "live" ? formData.liveUrl : undefined,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, createMutation.mutateAsync({
                        moduleId: 1, // TODO: use actual moduleId
                        title: formData.title,
                        type: formData.type,
                        content: formData.type === "text" ? formData.content : undefined,
                        videoUrl: formData.type === "video" ? formData.videoUrl : undefined,
                        liveUrl: formData.type === "live" ? formData.liveUrl : undefined,
                        order: formData.order,
                    })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    setLocation("/professor/courses/".concat(courseId, "/lessons"));
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    alert("Erro ao salvar aula");
                    return [3 /*break*/, 8];
                case 7:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="text-slate-400 hover:text-white mb-4" onClick={function () { return setLocation("/professor/courses/".concat(courseId, "/lessons")); }}>
            <ArrowLeft className="w-4 h-4 mr-2"/>
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">
            {lessonId ? "Editar Aula" : "Nova Aula"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Informações da Aula</CardTitle>
            <CardDescription className="text-slate-400">
              Preencha os dados da aula
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                  Título da Aula
                </Label>
                <Input id="title" placeholder="Ex: Introdução ao tema" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} className="bg-slate-700 border-slate-600 text-white" required/>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">
                  Tipo de Aula
                </Label>
                <Select value={formData.type} onValueChange={function (value) {
            return setFormData(__assign(__assign({}, formData), { type: value }));
        }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="video">Vídeo (YouTube)</SelectItem>
                    <SelectItem value="live">Ao Vivo (Google Meet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content based on type */}
              {formData.type === "text" && (<div className="space-y-2">
                  <Label htmlFor="content" className="text-white">
                    Conteúdo da Aula
                  </Label>
                  <Textarea id="content" placeholder="Digite o conteúdo da aula (suporta HTML)" value={formData.content} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { content: e.target.value })); }} className="bg-slate-700 border-slate-600 text-white min-h-40" required/>
                </div>)}

              {formData.type === "video" && (<div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-white">
                    URL do Vídeo (YouTube)
                  </Label>
                  <Input id="videoUrl" placeholder="Ex: https://www.youtube.com/watch?v=..." value={formData.videoUrl} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { videoUrl: e.target.value })); }} className="bg-slate-700 border-slate-600 text-white" required/>
                </div>)}

              {formData.type === "live" && (<div className="space-y-2">
                  <Label htmlFor="liveUrl" className="text-white">
                    URL da Aula Ao Vivo (Google Meet)
                  </Label>
                  <Input id="liveUrl" placeholder="Ex: https://meet.google.com/..." value={formData.liveUrl} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { liveUrl: e.target.value })); }} className="bg-slate-700 border-slate-600 text-white" required/>
                </div>)}

              {/* Order */}
              {!lessonId && (<div className="space-y-2">
                  <Label htmlFor="order" className="text-white">
                    Ordem da Aula
                  </Label>
                  <Input id="order" type="number" min="1" value={formData.order} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { order: parseInt(e.target.value) })); }} className="bg-slate-700 border-slate-600 text-white"/>
                </div>)}

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" onClick={function () { return setLocation("/professor/courses/".concat(courseId, "/lessons")); }} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  {isSubmitting ? "Salvando..." : "Salvar Aula"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>);
}
