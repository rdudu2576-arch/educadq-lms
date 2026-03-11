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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2, Video, BookOpen } from "lucide-react";
export default function LessonsManagement() {
    var _a = useState(null), selectedCourse = _a[0], setSelectedCourse = _a[1];
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = useState(null), editingLesson = _c[0], setEditingLesson = _c[1];
    var _d = useState({
        title: "",
        type: "text",
        content: "",
        videoUrl: "",
        liveUrl: "",
    }), formData = _d[0], setFormData = _d[1];
    var _e = trpc.courses.list.useQuery({ limit: 100, offset: 0 }).data, courses = _e === void 0 ? [] : _e;
    var _f = trpc.lessons.getByCourse.useQuery({ courseId: selectedCourse || 0 }, { enabled: !!selectedCourse }), _g = _f.data, lessons = _g === void 0 ? [] : _g, refetchLessons = _f.refetch;
    var createLessonMutation = trpc.lessons.create.useMutation({
        onSuccess: function () {
            toast.success("Aula criada com sucesso!");
            resetForm();
            refetchLessons();
        },
        onError: function (error) { return toast.error("Erro: ".concat(error === null || error === void 0 ? void 0 : error.message)); },
    });
    var updateLessonMutation = trpc.lessons.update.useMutation({
        onSuccess: function () {
            toast.success("Aula atualizada com sucesso!");
            resetForm();
            refetchLessons();
        },
        onError: function (error) { return toast.error("Erro: ".concat(error === null || error === void 0 ? void 0 : error.message)); },
    });
    // const deleteLessonMutation = trpc.lessons.delete.useMutation({
    //   onSuccess: () => {
    //     toast.success("Aula deletada com sucesso!");
    //     refetchLessons();
    //   },
    //   onError: (error: any) => toast.error(`Erro: ${error?.message}`),
    // });
    var resetForm = function () {
        setFormData({ title: "", type: "text", content: "", videoUrl: "", liveUrl: "" });
        setEditingLesson(null);
        setIsOpen(false);
    };
    var handleSubmit = function () {
        if (!formData.title || !selectedCourse) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }
        if (editingLesson) {
            updateLessonMutation.mutate({
                lessonId: editingLesson.id,
                title: formData.title,
                type: formData.type,
                content: formData.type === "text" ? formData.content : undefined,
                videoUrl: formData.type === "video" ? formData.videoUrl : undefined,
                liveUrl: formData.type === "live" ? formData.liveUrl : undefined,
            });
        }
        else {
            createLessonMutation.mutate({
                moduleId: 1, // TODO: use actual moduleId
                title: formData.title,
                type: formData.type,
                content: formData.type === "text" ? formData.content : undefined,
                videoUrl: formData.type === "video" ? formData.videoUrl : undefined,
                liveUrl: formData.type === "live" ? formData.liveUrl : undefined,
                order: lessons.length + 1,
            });
        }
    };
    var handleEdit = function (lesson) {
        setEditingLesson(lesson);
        setFormData({
            title: lesson.title,
            type: lesson.type,
            content: lesson.content || "",
            videoUrl: lesson.videoUrl || "",
            liveUrl: lesson.liveUrl || "",
        });
        setIsOpen(true);
    };
    var getTypeIcon = function (type) {
        switch (type) {
            case "video":
                return <Video className="w-4 h-4"/>;
            case "live":
                return <Video className="w-4 h-4"/>;
            default:
                return <BookOpen className="w-4 h-4"/>;
        }
    };
    var getTypeLabel = function (type) {
        switch (type) {
            case "video":
                return "Vídeo";
            case "live":
                return "Ao Vivo";
            default:
                return "Texto";
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Gerenciar Aulas</h1>
          <p className="text-slate-400">Crie e edite aulas para seus cursos</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course Selector */}
          <Card className="bg-slate-800 border-slate-700 h-fit">
            <CardHeader>
              <CardTitle className="text-white">Cursos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {courses === null || courses === void 0 ? void 0 : courses.map(function (course) { return (<Button key={course.id} variant={selectedCourse === course.id ? "default" : "outline"} className={"w-full justify-start ".concat(selectedCourse === course.id
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "text-white border-slate-600 hover:bg-slate-700")} onClick={function () { return setSelectedCourse(course.id); }}>
                  {course.title}
                </Button>); })}
            </CardContent>
          </Card>

          {/* Lessons List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {selectedCourse ? "Aulas" : "Selecione um curso"}
              </h2>
              {selectedCourse && (<Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={function () { return resetForm(); }} className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-2"/>
                      Nova Aula
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {editingLesson ? "Editar Aula" : "Nova Aula"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                          Título *
                        </Label>
                        <Input id="title" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} placeholder="Título da aula" className="bg-slate-700 border-slate-600 text-white"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-white">
                          Tipo de Aula
                        </Label>
                        <Select value={formData.type} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { type: value })); }}>
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

                      {formData.type === "text" && (<div className="space-y-2">
                          <Label htmlFor="content" className="text-white">
                            Conteúdo
                          </Label>
                          <Textarea id="content" value={formData.content} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { content: e.target.value })); }} placeholder="Conteúdo da aula..." className="bg-slate-700 border-slate-600 text-white" rows={4}/>
                        </div>)}

                      {formData.type === "video" && (<div className="space-y-2">
                          <Label htmlFor="videoUrl" className="text-white">
                            URL do Vídeo (YouTube)
                          </Label>
                          <Input id="videoUrl" value={formData.videoUrl} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { videoUrl: e.target.value })); }} placeholder="https://youtube.com/watch?v=..." className="bg-slate-700 border-slate-600 text-white"/>
                        </div>)}

                      {formData.type === "live" && (<div className="space-y-2">
                          <Label htmlFor="liveUrl" className="text-white">
                            URL da Aula ao Vivo (Google Meet)
                          </Label>
                          <Input id="liveUrl" value={formData.liveUrl} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { liveUrl: e.target.value })); }} placeholder="https://meet.google.com/..." className="bg-slate-700 border-slate-600 text-white"/>
                        </div>)}

                      <Button onClick={handleSubmit} disabled={createLessonMutation.isPending || updateLessonMutation.isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                        {editingLesson ? "Atualizar" : "Criar"} Aula
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>)}
            </div>

            {selectedCourse ? (<div className="space-y-3">
                {(lessons === null || lessons === void 0 ? void 0 : lessons.length) === 0 ? (<Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6 text-center text-slate-400">
                      Nenhuma aula criada ainda
                    </CardContent>
                  </Card>) : (lessons === null || lessons === void 0 ? void 0 : lessons.map(function (lesson) { return (<Card key={lesson.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getTypeIcon(lesson.type)}
                            <div>
                              <h3 className="font-semibold text-white">{lesson.title}</h3>
                              <p className="text-sm text-slate-400">{getTypeLabel(lesson.type)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={function () { return handleEdit(lesson); }} className="text-white border-slate-600 hover:bg-slate-700">
                              <Edit2 className="w-4 h-4"/>
                            </Button>
                            {/* <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteLessonMutation.mutate({ lessonId: lesson.id })}
                  disabled={deleteLessonMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button> */}
                          </div>
                        </div>
                      </CardContent>
                    </Card>); }))}
              </div>) : (<Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center text-slate-400">
                  Selecione um curso para gerenciar suas aulas
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>);
}
