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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { Loader2, Save, ArrowLeft, Plus, Edit2, BookOpen, Video, Trash2 } from "lucide-react";
export default function EditCoursePage() {
    var _this = this;
    var _a = useRoute("/admin/courses/:courseId/edit"), params = _a[1];
    var _b = useLocation(), setLocation = _b[1];
    var courseId = (params === null || params === void 0 ? void 0 : params.courseId) ? parseInt(params.courseId) : null;
    var _c = useState({
        title: "",
        description: "",
        courseHours: "",
        price: "",
        coverUrl: "",
        trailerUrl: "",
        professorId: "",
        minimumGrade: "",
        maxInstallments: "",
    }), formData = _c[0], setFormData = _c[1];
    var _d = useState(false), isLessonDialogOpen = _d[0], setIsLessonDialogOpen = _d[1];
    var _e = useState(null), editingLesson = _e[0], setEditingLesson = _e[1];
    var _f = useState(null), defaultModuleId = _f[0], setDefaultModuleId = _f[1];
    var _g = useState({
        title: "",
        type: "text",
        content: "",
        videoUrl: "",
        liveUrl: "",
    }), lessonFormData = _g[0], setLessonFormData = _g[1];
    var _h = trpc.courses.getById.useQuery({ courseId: courseId || 0 }, { enabled: !!courseId }), course = _h.data, courseLoading = _h.isLoading;
    var _j = trpc.lessons.getByCourse.useQuery({ courseId: courseId || 0 }, { enabled: !!courseId }), _k = _j.data, lessons = _k === void 0 ? [] : _k, refetchLessons = _j.refetch;
    var _l = trpc.lessons.getModulesByCourse.useQuery({ courseId: courseId || 0 }, { enabled: !!courseId }).data, modules = _l === void 0 ? [] : _l;
    var createModuleMutation = trpc.lessons.createModule.useMutation({
        onSuccess: function (module) {
            setDefaultModuleId((module === null || module === void 0 ? void 0 : module.id) || null);
            toast.success("Módulo padrão criado!");
        },
        onError: function (error) {
            toast.error("Erro ao criar módulo: " + error.message);
        },
    });
    var updateCourseMutation = trpc.courses.update.useMutation({
        onSuccess: function () {
            toast.success("Curso atualizado com sucesso!");
        },
        onError: function (error) {
            toast.error("Erro ao atualizar curso: " + error.message);
        },
    });
    var createLessonMutation = trpc.lessons.create.useMutation({
        onSuccess: function () {
            toast.success("Aula criada com sucesso!");
            setIsLessonDialogOpen(false);
            resetLessonForm();
            refetchLessons();
        },
        onError: function (error) {
            toast.error("Erro ao criar aula: " + error.message);
        },
    });
    var updateLessonMutation = trpc.lessons.update.useMutation({
        onSuccess: function () {
            toast.success("Aula atualizada com sucesso!");
            setIsLessonDialogOpen(false);
            resetLessonForm();
            refetchLessons();
        },
        onError: function (error) {
            toast.error("Erro ao atualizar aula: " + error.message);
        },
    });
    // const deleteLessonMutation = trpc.lessons.delete.useMutation({
    //   onSuccess: () => {
    //     toast.success("Aula deletada com sucesso!");
    //     refetchLessons();
    //   },
    //   onError: (error: any) => {
    //     toast.error("Erro ao deletar aula: " + error.message);
    //   },
    // });
    useEffect(function () {
        var _a, _b, _c, _d, _e;
        if (course) {
            setFormData({
                title: course.title || "",
                description: course.description || "",
                courseHours: ((_a = course.courseHours) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                price: ((_b = course.price) === null || _b === void 0 ? void 0 : _b.toString()) || "",
                coverUrl: course.coverUrl || "",
                trailerUrl: course.trailerUrl || "",
                professorId: ((_c = course.professorId) === null || _c === void 0 ? void 0 : _c.toString()) || "",
                minimumGrade: ((_d = course.minimumGrade) === null || _d === void 0 ? void 0 : _d.toString()) || "",
                maxInstallments: ((_e = course.maxInstallments) === null || _e === void 0 ? void 0 : _e.toString()) || "",
            });
        }
    }, [course]);
    // Create default module if none exists
    useEffect(function () {
        if (courseId && modules.length === 0 && !defaultModuleId) {
            createModuleMutation.mutate({
                courseId: courseId,
                title: "Módulo Principal",
                description: "Módulo padrão do curso",
                order: 1,
            });
        }
        else if (modules.length > 0 && !defaultModuleId) {
            setDefaultModuleId(modules[0].id);
        }
    }, [courseId, modules, defaultModuleId]);
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!courseId)
                return [2 /*return*/];
            updateCourseMutation.mutate({
                courseId: courseId,
                title: formData.title,
                description: formData.description,
                coverUrl: formData.coverUrl,
                trailerUrl: formData.trailerUrl,
                courseHours: parseInt(formData.courseHours) || 0,
                price: formData.price,
                minimumGrade: parseInt(formData.minimumGrade) || 70,
                maxInstallments: parseInt(formData.maxInstallments) || 1,
            });
            return [2 /*return*/];
        });
    }); };
    var resetLessonForm = function () {
        setLessonFormData({
            title: "",
            type: "text",
            content: "",
            videoUrl: "",
            liveUrl: "",
        });
        setEditingLesson(null);
    };
    var handleLessonSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('[DEBUG] handleLessonSubmit called', { lessonFormData: lessonFormData, defaultModuleId: defaultModuleId, courseId: courseId });
                    if (!lessonFormData.title.trim()) {
                        toast.error("Título da aula é obrigatório");
                        return [2 /*return*/];
                    }
                    if (!courseId) {
                        console.error('[DEBUG] courseId is missing');
                        return [2 /*return*/];
                    }
                    if (!editingLesson) return [3 /*break*/, 1];
                    updateLessonMutation.mutate(__assign({ lessonId: editingLesson.id }, lessonFormData));
                    return [3 /*break*/, 7];
                case 1:
                    if (!defaultModuleId) {
                        toast.error("Módulo não disponível. Tente novamente.");
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, fetch("/api/lessons", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(__assign(__assign({ moduleId: defaultModuleId }, lessonFormData), { order: lessons.length + 1 })),
                        })];
                case 3:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 4:
                    error = _a.sent();
                    toast.error("Erro ao criar aula: " + error.error);
                    return [2 /*return*/];
                case 5:
                    toast.success("Aula criada com sucesso!");
                    setIsLessonDialogOpen(false);
                    resetLessonForm();
                    refetchLessons();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    toast.error("Erro ao criar aula: " + error_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleEditLesson = function (lesson) {
        setEditingLesson(lesson);
        setLessonFormData({
            title: lesson.title,
            type: lesson.type,
            content: lesson.content || "",
            videoUrl: lesson.videoUrl || "",
            liveUrl: lesson.liveUrl || "",
        });
        setIsLessonDialogOpen(true);
    };
    var handleDeleteLesson = function (lessonId) {
        if (confirm("Tem certeza que deseja deletar esta aula?")) {
            toast.info("Funcionalidade de deletar aula em desenvolvimento");
            // deleteLessonMutation.mutate({ lessonId });
        }
    };
    if (courseLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin"/>
      </div>);
    }
    return (<div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={function () { return setLocation("/admin"); }} className="text-white border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4"/>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Editar Curso</h1>
              <p className="text-slate-400">Atualize os dados do curso e suas aulas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Form and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações Básicas</CardTitle>
                <CardDescription className="text-slate-400">Dados principais do curso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Título do Curso *
                  </Label>
                  <Input id="title" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} placeholder="Ex: Python Avançado" className="bg-slate-700 border-slate-600 text-white"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Descrição *
                  </Label>
                  <Textarea id="description" value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="Descreva o conteúdo do curso..." className="bg-slate-700 border-slate-600 text-white" rows={4}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseHours" className="text-white">
                      Carga Horária (horas) *
                    </Label>
                    <Input id="courseHours" type="number" value={formData.courseHours} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { courseHours: e.target.value })); }} placeholder="40" className="bg-slate-700 border-slate-600 text-white"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white">
                      Preço (R$) *
                    </Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { price: e.target.value })); }} placeholder="299.90" className="bg-slate-700 border-slate-600 text-white"/>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Mídia</CardTitle>
                <CardDescription className="text-slate-400">Capa e trailer do curso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverUrl" className="text-white">
                      URL da Capa
                    </Label>
                    <Input id="coverUrl" value={formData.coverUrl} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { coverUrl: e.target.value })); }} placeholder="https://..." className="bg-slate-700 border-slate-600 text-white"/>
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="trailerUrl" className="text-white">
                    URL do Trailer (YouTube)
                  </Label>
                  <Input id="trailerUrl" value={formData.trailerUrl} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { trailerUrl: e.target.value })); }} placeholder="https://youtube.com/watch?v=..." className="bg-slate-700 border-slate-600 text-white"/>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configurações</CardTitle>
                <CardDescription className="text-slate-400">Parâmetros do curso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="professor" className="text-white">
                      Professor
                    </Label>
                    <Input id="professor" type="number" value={formData.professorId} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { professorId: e.target.value })); }} placeholder="ID do professor" className="bg-slate-700 border-slate-600 text-white"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minGrade" className="text-white">
                      Nota Mínima (%)
                    </Label>
                    <Input id="minGrade" type="number" value={formData.minimumGrade} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { minimumGrade: e.target.value })); }} placeholder="70" className="bg-slate-700 border-slate-600 text-white"/>
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxInstallments" className="text-white">
                      Número de Parcelas
                    </Label>
                    <Input id="maxInstallments" type="number" value={formData.maxInstallments} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { maxInstallments: e.target.value })); }} placeholder="3" className="bg-slate-700 border-slate-600 text-white"/>
                  </div>
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} disabled={updateCourseMutation.isPending} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" size="lg">
              <Save className="w-4 h-4 mr-2"/>
              Salvar Alterações
            </Button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold">{formData.title || "Título do Curso"}</h3>
                  <p className="text-slate-400 text-sm mt-2">{formData.description || "Descrição do curso"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white text-sm">
                    <strong>{formData.courseHours || "0"} horas</strong>
                  </p>
                  <p className="text-cyan-400 text-lg font-bold">
                    R$ {parseFloat(formData.price || "0").toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="mt-0">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Aulas do Curso</CardTitle>
              <CardDescription className="text-slate-400">Gerenciar aulas (vídeo, texto, ao vivo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLessonDialogOpen ? (<Card className="bg-slate-700 border-slate-600 p-4 mb-4">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {editingLesson ? "Editar Aula" : "Nova Aula"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={function (e) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            e.preventDefault();
                            console.log('[DEBUG] Form submitted');
                            return [4 /*yield*/, handleLessonSubmit()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lesson-title" className="text-white">
                        Título *
                      </Label>
                      <Input id="lesson-title" value={lessonFormData.title} onChange={function (e) { return setLessonFormData(__assign(__assign({}, lessonFormData), { title: e.target.value })); }} placeholder="Título da aula" className="bg-slate-700 border-slate-600 text-white"/>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-type" className="text-white">
                        Tipo de Aula
                      </Label>
                      <Select value={lessonFormData.type} onValueChange={function (value) { return setLessonFormData(__assign(__assign({}, lessonFormData), { type: value })); }}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="text" className="text-white">Texto</SelectItem>
                          <SelectItem value="video" className="text-white">Vídeo (YouTube)</SelectItem>
                          <SelectItem value="live" className="text-white">Ao Vivo (Google Meet)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {lessonFormData.type === "text" && (<div className="space-y-2">
                        <Label htmlFor="lesson-content" className="text-white">
                          Conteúdo
                        </Label>
                        <Textarea id="lesson-content" value={lessonFormData.content} onChange={function (e) { return setLessonFormData(__assign(__assign({}, lessonFormData), { content: e.target.value })); }} placeholder="Conteúdo da aula..." className="bg-slate-700 border-slate-600 text-white" rows={4}/>
                      </div>)}

                    {lessonFormData.type === "video" && (<div className="space-y-2">
                        <Label htmlFor="lesson-video" className="text-white">
                          URL do Vídeo (YouTube)
                        </Label>
                        <Input id="lesson-video" value={lessonFormData.videoUrl} onChange={function (e) { return setLessonFormData(__assign(__assign({}, lessonFormData), { videoUrl: e.target.value })); }} placeholder="https://youtube.com/watch?v=..." className="bg-slate-700 border-slate-600 text-white"/>
                      </div>)}

                    {lessonFormData.type === "live" && (<div className="space-y-2">
                        <Label htmlFor="lesson-live" className="text-white">
                          URL da Aula ao Vivo (Google Meet)
                        </Label>
                        <Input id="lesson-live" value={lessonFormData.liveUrl} onChange={function (e) { return setLessonFormData(__assign(__assign({}, lessonFormData), { liveUrl: e.target.value })); }} placeholder="https://meet.google.com/..." className="bg-slate-700 border-slate-600 text-white"/>
                      </div>)}

                      <div className="flex gap-2">
                        <Button type="submit" disabled={createLessonMutation.isPending || updateLessonMutation.isPending} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                          {editingLesson ? "Atualizar" : "Criar"} Aula
                        </Button>
                        <Button type="button" onClick={function () {
                setIsLessonDialogOpen(false);
                resetLessonForm();
            }} className="flex-1 bg-slate-600 hover:bg-slate-700">
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>) : (<Button onClick={function () {
                resetLessonForm();
                setIsLessonDialogOpen(true);
            }} className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 mr-2"/>
                  Nova Aula
                </Button>)}

              <div className="space-y-2">
                {lessons && lessons.length > 0 ? (lessons.map(function (lesson) { return (<Card key={lesson.id} className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {lesson.type === "video" ? (<Video className="w-4 h-4 text-cyan-500"/>) : (<BookOpen className="w-4 h-4 text-cyan-500"/>)}
                            <div>
                              <p className="text-white text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-slate-400">
                                {lesson.type === "text" ? "Texto" : lesson.type === "video" ? "Vídeo" : "Ao Vivo"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={function () { return handleEditLesson(lesson); }} className="text-cyan-500 hover:bg-slate-600">
                              <Edit2 className="w-3 h-3"/>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={function () { return handleDeleteLesson(lesson.id); }} className="text-red-500 hover:bg-slate-600">
                              <Trash2 className="w-3 h-3"/>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>); })) : (<p className="text-sm text-slate-400 text-center py-4">Nenhuma aula criada ainda</p>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
