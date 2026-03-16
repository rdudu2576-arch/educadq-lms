import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, Video, BookOpen, FolderPlus } from "lucide-react";

export default function LessonsManagement() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    type: "text" as "text" | "video" | "live",
    content: "",
    videoUrl: "",
    liveUrl: "",
    order: 0,
  });
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
    order: 0,
  });

  const { data: courses = [] } = trpc.courses.list.useQuery({ limit: 100, offset: 0 });
  
  const { data: modules = [], refetch: refetchModules } = trpc.lessons.getModulesByCourse.useQuery(
    { courseId: selectedCourse || 0 },
    { enabled: !!selectedCourse }
  );

  const { data: lessons = [], refetch: refetchLessons } = trpc.lessons.getByModule.useQuery(
    { moduleId: selectedModule || 0 },
    { enabled: !!selectedModule }
  );

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule(modules[0].id);
    } else if (modules.length === 0) {
      setSelectedModule(null);
    }
  }, [modules]);

  const createModuleMutation = trpc.lessons.createModule.useMutation({
    onSuccess: () => {
      toast.success("Módulo criado com sucesso!");
      setIsModuleDialogOpen(false);
      setModuleFormData({ title: "", description: "", order: 0 });
      refetchModules();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => {
      toast.success("Aula criada com sucesso!");
      resetLessonForm();
      refetchLessons();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const updateLessonMutation = trpc.lessons.update.useMutation({
    onSuccess: () => {
      toast.success("Aula atualizada com sucesso!");
      resetLessonForm();
      refetchLessons();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const deleteLessonMutation = trpc.lessons.delete.useMutation({
    onSuccess: () => {
      toast.success("Aula deletada com sucesso!");
      refetchLessons();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const resetLessonForm = () => {
    setLessonFormData({ title: "", type: "text", content: "", videoUrl: "", liveUrl: "", order: 0 });
    setEditingLesson(null);
    setIsLessonDialogOpen(false);
  };

  const handleLessonSubmit = () => {
    if (!lessonFormData.title || !selectedModule) {
      toast.error("Preencha os campos obrigatórios e selecione um módulo");
      return;
    }

    if (editingLesson) {
      updateLessonMutation.mutate({
        lessonId: editingLesson.id,
        title: lessonFormData.title,
        type: lessonFormData.type,
        content: lessonFormData.type === "text" ? lessonFormData.content : undefined,
        videoUrl: lessonFormData.type === "video" ? lessonFormData.videoUrl : undefined,
        liveUrl: lessonFormData.type === "live" ? lessonFormData.liveUrl : undefined,
      });
    } else {
      createLessonMutation.mutate({
        moduleId: selectedModule,
        title: lessonFormData.title,
        type: lessonFormData.type,
        content: lessonFormData.type === "text" ? lessonFormData.content : undefined,
        videoUrl: lessonFormData.type === "video" ? lessonFormData.videoUrl : undefined,
        liveUrl: lessonFormData.type === "live" ? lessonFormData.liveUrl : undefined,
        order: lessonFormData.order || lessons.length + 1,
      });
    }
  };

  const handleModuleSubmit = () => {
    if (!moduleFormData.title || !selectedCourse) {
      toast.error("Título do módulo é obrigatório");
      return;
    }
    createModuleMutation.mutate({
      courseId: selectedCourse,
      title: moduleFormData.title,
      description: moduleFormData.description,
      order: moduleFormData.order || modules.length + 1,
    });
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      type: lesson.type,
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      liveUrl: lesson.liveUrl || "",
      order: lesson.order,
    });
    setIsLessonDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "live": return <Video className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Gerenciar Aulas</h1>
          <p className="text-slate-400">Organize seu conteúdo em módulos e aulas</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seleção de Curso */}
          <Card className="bg-slate-800 border-slate-700 h-fit">
            <CardHeader>
              <CardTitle className="text-white">Cursos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {courses?.map((course: any) => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.id ? "default" : "outline"}
                  className={`w-full justify-start ${selectedCourse === course.id ? "bg-cyan-600" : "text-white border-slate-600"}`}
                  onClick={() => setSelectedCourse(course.id)}
                >
                  {course.title}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Módulos e Aulas */}
          <div className="lg:col-span-3 space-y-6">
            {selectedCourse ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Select value={selectedModule?.toString()} onValueChange={(v) => setSelectedModule(parseInt(v))}>
                      <SelectTrigger className="w-[250px] bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione um módulo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {modules.map((m: any) => (
                          <SelectItem key={m.id} value={m.id.toString()} className="text-white">{m.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
                          <FolderPlus className="w-4 h-4 mr-2" /> Novo Módulo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader><DialogTitle className="text-white">Novo Módulo</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white">Título do Módulo</Label>
                            <Input value={moduleFormData.title} onChange={(e) => setModuleFormData({...moduleFormData, title: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                          </div>
                          <Button onClick={handleModuleSubmit} className="w-full bg-cyan-600">Criar Módulo</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {selectedModule && (
                    <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => resetLessonForm()} className="bg-cyan-600 hover:bg-cyan-700">
                          <Plus className="w-4 h-4 mr-2" /> Nova Aula
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader><DialogTitle className="text-white">{editingLesson ? "Editar Aula" : "Nova Aula"}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-white">Título *</Label>
                            <Input value={lessonFormData.title} onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Tipo</Label>
                            <Select value={lessonFormData.type} onValueChange={(v: any) => setLessonFormData({...lessonFormData, type: v})}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="text" className="text-white">Texto</SelectItem>
                                <SelectItem value="video" className="text-white">Vídeo (YouTube)</SelectItem>
                                <SelectItem value="live" className="text-white">Ao Vivo (Google Meet)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {lessonFormData.type === "text" && (
                            <div className="space-y-2">
                              <Label className="text-white">Conteúdo</Label>
                              <Textarea value={lessonFormData.content} onChange={(e) => setLessonFormData({...lessonFormData, content: e.target.value})} className="bg-slate-700 border-slate-600 text-white" rows={4} />
                            </div>
                          )}
                          {lessonFormData.type === "video" && (
                            <div className="space-y-2">
                              <Label className="text-white">URL do Vídeo</Label>
                              <Input value={lessonFormData.videoUrl} onChange={(e) => setLessonFormData({...lessonFormData, videoUrl: e.target.value})} className="bg-slate-700 border-slate-600 text-white" />
                            </div>
                          )}
                          <Button onClick={handleLessonSubmit} className="w-full bg-cyan-600">{editingLesson ? "Atualizar" : "Criar"} Aula</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-3">
                  {!selectedModule ? (
                    <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6 text-center text-slate-400">Selecione ou crie um módulo para ver as aulas</CardContent></Card>
                  ) : lessons.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6 text-center text-slate-400">Nenhuma aula neste módulo</CardContent></Card>
                  ) : (
                    lessons.map((lesson: any) => (
                      <Card key={lesson.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(lesson.type)}
                            <div>
                              <h3 className="font-semibold text-white">{lesson.title}</h3>
                              <p className="text-sm text-slate-400">{lesson.type}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditLesson(lesson)} className="text-white border-slate-600 hover:bg-slate-700"><Edit2 className="w-4 h-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteLessonMutation.mutate({ lessonId: lesson.id })} className="bg-red-900"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6 text-center text-slate-400">Selecione um curso para gerenciar</CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
