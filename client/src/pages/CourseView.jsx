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
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Video, Users, Lock, CheckCircle, ExternalLink, FolderOpen, ArrowLeft, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useContentProtection } from "@/hooks/useContentProtection";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { extractYouTubeId } from "@/services/lessonService";
import { toast } from "sonner";
export default function CourseView(_a) {
    var _this = this;
    var _b, _c;
    var params = _a.params;
    var _d = useAuth(), user = _d.user, loading = _d.loading;
    var _e = useLocation(), setLocation = _e[1];
    var courseId = parseInt(params.courseId);
    var _f = useState(0), selectedLessonIndex = _f[0], setSelectedLessonIndex = _f[1];
    // Protect content from copying
    useContentProtection();
    // Fetch course with lessons
    var _g = trpc.courses.getById.useQuery({ courseId: courseId }, { enabled: !!user && !isNaN(courseId) }), course = _g.data, courseLoading = _g.isLoading;
    // Fetch progress - only if enrolled
    var _h = trpc.progress.getCourseProgress.useQuery({ courseId: courseId }, { enabled: !!user && !isNaN(courseId), retry: false }), progress = _h.data, refetchProgress = _h.refetch;
    // Fetch materials for current lesson
    var currentLesson = (_b = course === null || course === void 0 ? void 0 : course.lessons) === null || _b === void 0 ? void 0 : _b[selectedLessonIndex];
    var lessonMaterials = trpc.lessons.getMaterials.useQuery({ lessonId: (_c = currentLesson === null || currentLesson === void 0 ? void 0 : currentLesson.id) !== null && _c !== void 0 ? _c : 0 }, { enabled: !!(currentLesson === null || currentLesson === void 0 ? void 0 : currentLesson.id) }).data;
    // Fetch assessments for this course
    var assessments = trpc.assessments.getByCourse.useQuery({ courseId: courseId }, { enabled: !!user && !isNaN(courseId) }).data;
    // Record completion mutation
    var completionMutation = trpc.progress.recordCompletion.useMutation({
        onSuccess: function () {
            toast.success("Aula marcada como concluída!");
            refetchProgress();
        },
        onError: function (err) {
            toast.error(err.message || "Erro ao marcar aula como concluída");
        },
    });
    // Memoize completed lesson IDs
    var completedLessonIds = useMemo(function () {
        var _a;
        return new Set(((_a = progress === null || progress === void 0 ? void 0 : progress.progress) === null || _a === void 0 ? void 0 : _a.map(function (p) { return p.lessonId; })) || []);
    }, [progress]);
    var progressPercentage = (progress === null || progress === void 0 ? void 0 : progress.percentage) || 0;
    var handleLessonComplete = function (lessonId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, completionMutation.mutateAsync({ lessonId: lessonId })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSelectLesson = function (index) {
        var _a;
        // First lesson is always accessible
        if (index === 0) {
            setSelectedLessonIndex(index);
            return;
        }
        // Check if previous lesson is completed (sequential lock)
        var prevLesson = (_a = course === null || course === void 0 ? void 0 : course.lessons) === null || _a === void 0 ? void 0 : _a[index - 1];
        if (prevLesson && !completedLessonIds.has(prevLesson.id)) {
            toast.error("Complete a aula anterior para desbloquear esta.");
            return;
        }
        setSelectedLessonIndex(index);
    };
    // Loading state
    if (loading || courseLoading) {
        return (<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    if (!user || !course) {
        return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4"/>
            <p className="text-slate-400 mb-4">Curso não encontrado ou você não tem acesso.</p>
            <Button onClick={function () { return setLocation("/"); }} variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-2"/> Voltar
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    var lessons = course.lessons || [];
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Button onClick={function () { return setLocation("/student"); }} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1"/> Meus Cursos
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{course.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Progresso</span>
                <span className="text-cyan-400 font-semibold">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-slate-700"/>
            </div>
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {completedLessonIds.size}/{lessons.length} aulas
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Aulas ({lessons.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                  {lessons.map(function (lesson, index) {
            var isCompleted = completedLessonIds.has(lesson.id);
            var isLocked = index > 0 && !completedLessonIds.has(lessons[index - 1].id);
            var isSelected = selectedLessonIndex === index;
            return (<button key={lesson.id} onClick={function () { return handleSelectLesson(index); }} disabled={isLocked} className={"w-full text-left p-3 rounded-lg transition-all flex items-center gap-2 text-sm ".concat(isSelected
                    ? "bg-cyan-600/20 text-cyan-400 border border-cyan-600/40"
                    : isLocked
                        ? "bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-60"
                        : isCompleted
                            ? "bg-green-900/20 text-green-400 hover:bg-green-900/30"
                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-700")}>
                        <span className="flex-shrink-0">
                          {isLocked ? (<Lock className="w-4 h-4"/>) : isCompleted ? (<CheckCircle className="w-4 h-4 text-green-400"/>) : lesson.type === "video" ? (<Video className="w-4 h-4"/>) : lesson.type === "text" ? (<FileText className="w-4 h-4"/>) : lesson.type === "live" ? (<Users className="w-4 h-4"/>) : (<FolderOpen className="w-4 h-4"/>)}
                        </span>
                        <span className="flex-1 truncate">{lesson.title}</span>
                      </button>);
        })}
                </div>

                {/* Assessments */}
                {assessments && assessments.length > 0 && (<div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2 px-2">Avaliações</p>
                    {assessments.map(function (assessment) { return (<button key={assessment.id} onClick={function () { return setLocation("/assessments/".concat(assessment.id)); }} className="w-full text-left p-3 rounded-lg bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 transition-all flex items-center gap-2 text-sm mb-1">
                        <BookOpen className="w-4 h-4 flex-shrink-0"/>
                        <span className="flex-1 truncate">{assessment.title}</span>
                      </button>); })}
                  </div>)}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {currentLesson ? (<div className="space-y-6">
                {/* Lesson Header */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{currentLesson.title}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      {currentLesson.type === "video" ? "Vídeo" : currentLesson.type === "text" ? "Texto" : currentLesson.type === "live" ? "Ao Vivo" : "Material"}
                    </Badge>
                    {currentLesson.durationMinutes && (<span className="text-xs text-slate-500">{currentLesson.durationMinutes} min</span>)}
                  </div>
                </div>

                {/* Video Lesson - YouTube Embed */}
                {currentLesson.type === "video" && currentLesson.videoUrl && (function () {
                var ytId = extractYouTubeId(currentLesson.videoUrl);
                return ytId ? (<Card className="bg-slate-800 border-slate-700 overflow-hidden">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe className="absolute top-0 left-0 w-full h-full" src={"https://www.youtube.com/embed/".concat(ytId, "?rel=0&modestbranding=1&cc_load_policy=1")} title={currentLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: "none" }}/>
                      </div>
                    </Card>) : (<Card className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6 text-center">
                        <p className="text-red-400">URL do YouTube inválida: {currentLesson.videoUrl}</p>
                      </CardContent>
                    </Card>);
            })()}

                {/* Live Lesson - Google Meet */}
                {currentLesson.type === "live" && (<Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="w-16 h-16 text-cyan-500 mx-auto mb-4"/>
                        <h3 className="text-white text-lg font-semibold mb-2">Aula ao Vivo</h3>
                        <p className="text-slate-400 mb-6">Clique no botão abaixo para entrar na sala do Google Meet.</p>
                        {currentLesson.liveUrl ? (<Button onClick={function () { return window.open(currentLesson.liveUrl, "_blank"); }} className="bg-cyan-600 hover:bg-cyan-700" size="lg">
                            <ExternalLink className="w-4 h-4 mr-2"/> Entrar na Aula ao Vivo
                          </Button>) : (<p className="text-slate-500">Link da aula ainda não disponível.</p>)}
                      </div>
                    </CardContent>
                  </Card>)}

                {/* Text Lesson */}
                {currentLesson.type === "text" && (<Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      {currentLesson.content ? (<div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-cyan-400 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: currentLesson.content }}/>) : (<p className="text-slate-400">Conteúdo da aula não disponível.</p>)}
                    </CardContent>
                  </Card>)}

                {/* Material Lesson - Google Drive */}
                {currentLesson.type === "material" && (<Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="text-center py-4">
                        <FolderOpen className="w-12 h-12 text-cyan-500 mx-auto mb-3"/>
                        <h3 className="text-white font-semibold mb-2">Material Complementar</h3>
                        {currentLesson.content && (<p className="text-slate-400 mb-4">{currentLesson.content}</p>)}
                      </div>
                    </CardContent>
                  </Card>)}

                {/* Materials Section - Google Drive Links */}
                {lessonMaterials && lessonMaterials.length > 0 && (<Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-cyan-500"/>
                        Materiais Complementares
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lessonMaterials.map(function (material) { return (<a key={material.id} href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group">
                            <ExternalLink className="w-4 h-4 text-cyan-500 group-hover:text-cyan-400 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{material.title}</p>
                              <p className="text-xs text-slate-500">{material.type}</p>
                            </div>
                          </a>); })}
                      </div>
                    </CardContent>
                  </Card>)}

                {/* No materials placeholder */}
                {(!lessonMaterials || lessonMaterials.length === 0) && (<Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-slate-500">
                        <FolderOpen className="w-5 h-5"/>
                        <span className="text-sm">Nenhum material complementar para esta aula.</span>
                      </div>
                    </CardContent>
                  </Card>)}

                {/* Complete Button */}
                {!completedLessonIds.has(currentLesson.id) ? (<Button onClick={function () { return handleLessonComplete(currentLesson.id); }} disabled={completionMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white py-3" size="lg">
                    {completionMutation.isPending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Marcando...</>) : (<><CheckCircle className="w-4 h-4 mr-2"/> Marcar como Concluída</>)}
                  </Button>) : (<div className="flex items-center justify-center gap-2 py-3 text-green-400">
                    <CheckCircle className="w-5 h-5"/>
                    <span className="font-semibold">Aula concluída</span>
                  </div>)}
              </div>) : (<div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4"/>
                <p className="text-slate-400">Selecione uma aula para começar.</p>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
