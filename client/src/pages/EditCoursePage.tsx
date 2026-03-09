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
import { useLocation, useRoute } from "wouter";
import { Loader2, Save, ArrowLeft, Plus, Edit2, BookOpen, Video, Trash2 } from "lucide-react";

export default function EditCoursePage() {
  const [, params] = useRoute("/admin/courses/:courseId/edit");
  const [, setLocation] = useLocation();
  const courseId = params?.courseId ? parseInt(params.courseId) : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseHours: "",
    price: "",
    coverUrl: "",
    trailerUrl: "",
    professorId: "",
    minimumGrade: "",
    maxInstallments: "",
  });

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [defaultModuleId, setDefaultModuleId] = useState<number | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    type: "text" as "text" | "video" | "live",
    content: "",
    videoUrl: "",
    liveUrl: "",
  });

  const { data: course, isLoading: courseLoading } = trpc.courses.getById.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  const { data: lessons = [], refetch: refetchLessons } = trpc.lessons.getByCourse.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  const { data: modules = [] } = trpc.lessons.getModulesByCourse.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  const createModuleMutation = trpc.lessons.createModule.useMutation({
    onSuccess: (module) => {
      setDefaultModuleId(module?.id || null);
      toast.success("Módulo padrão criado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar módulo: " + error.message);
    },
  });

  const updateCourseMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      toast.success("Curso atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar curso: " + error.message);
    },
  });

  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => {
      toast.success("Aula criada com sucesso!");
      setIsLessonDialogOpen(false);
      resetLessonForm();
      refetchLessons();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar aula: " + error.message);
    },
  });

  const updateLessonMutation = trpc.lessons.update.useMutation({
    onSuccess: () => {
      toast.success("Aula atualizada com sucesso!");
      setIsLessonDialogOpen(false);
      resetLessonForm();
      refetchLessons();
    },
    onError: (error: any) => {
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

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        courseHours: course.courseHours?.toString() || "",
        price: course.price?.toString() || "",
        coverUrl: course.coverUrl || "",
        trailerUrl: course.trailerUrl || "",
        professorId: course.professorId?.toString() || "",
        minimumGrade: course.minimumGrade?.toString() || "",
        maxInstallments: course.maxInstallments?.toString() || "",
      });
    }
  }, [course]);

  // Create default module if none exists
  useEffect(() => {
    if (courseId && modules.length === 0 && !defaultModuleId) {
      createModuleMutation.mutate({
        courseId,
        title: "Módulo Principal",
        description: "Módulo padrão do curso",
        order: 1,
      });
    } else if (modules.length > 0 && !defaultModuleId) {
      setDefaultModuleId(modules[0].id);
    }
  }, [courseId, modules, defaultModuleId]);

  const handleSubmit = async () => {
    if (!courseId) return;

    updateCourseMutation.mutate({
      courseId,
      title: formData.title,
      description: formData.description,
      coverUrl: formData.coverUrl,
      trailerUrl: formData.trailerUrl,
      courseHours: parseInt(formData.courseHours) || 0,
      price: formData.price,
      minimumGrade: parseInt(formData.minimumGrade) || 70,
      maxInstallments: parseInt(formData.maxInstallments) || 1,
    });
  };

  const resetLessonForm = () => {
    setLessonFormData({
      title: "",
      type: "text",
      content: "",
      videoUrl: "",
      liveUrl: "",
    });
    setEditingLesson(null);
  };

  const handleLessonSubmit = async () => {
    console.log('[DEBUG] handleLessonSubmit called', { lessonFormData, defaultModuleId, courseId });
    
    if (!lessonFormData.title.trim()) {
      toast.error("Título da aula é obrigatório");
      return;
    }

    if (!courseId) {
      console.error('[DEBUG] courseId is missing');
      return;
    }

    if (editingLesson) {
      updateLessonMutation.mutate({
        lessonId: editingLesson.id,
        ...lessonFormData,
      });
    } else {
      if (!defaultModuleId) {
        toast.error("Módulo não disponível. Tente novamente.");
        return;
      }
      
      try {
        const response = await fetch("/api/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId: defaultModuleId,
            ...lessonFormData,
            order: lessons.length + 1,
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          toast.error("Erro ao criar aula: " + error.error);
          return;
        }
        
        toast.success("Aula criada com sucesso!");
        setIsLessonDialogOpen(false);
        resetLessonForm();
        refetchLessons();
      } catch (error: any) {
        toast.error("Erro ao criar aula: " + error.message);
      }
    }
  };

  const handleEditLesson = (lesson: any) => {
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

  const handleDeleteLesson = (lessonId: number) => {
    if (confirm("Tem certeza que deseja deletar esta aula?")) {
      toast.info("Funcionalidade de deletar aula em desenvolvimento");
      // deleteLessonMutation.mutate({ lessonId });
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/admin")}
              className="text-white border-slate-600 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
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
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Python Avançado"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o conteúdo do curso..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseHours" className="text-white">
                      Carga Horária (horas) *
                    </Label>
                    <Input
                      id="courseHours"
                      type="number"
                      value={formData.courseHours}
                      onChange={(e) => setFormData({ ...formData, courseHours: e.target.value })}
                      placeholder="40"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white">
                      Preço (R$) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="299.90"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
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
                    <Input
                      id="coverUrl"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="trailerUrl" className="text-white">
                    URL do Trailer (YouTube)
                  </Label>
                  <Input
                    id="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
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
                    <Input
                      id="professor"
                      type="number"
                      value={formData.professorId}
                      onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
                      placeholder="ID do professor"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minGrade" className="text-white">
                      Nota Mínima (%)
                    </Label>
                    <Input
                      id="minGrade"
                      type="number"
                      value={formData.minimumGrade}
                      onChange={(e) => setFormData({ ...formData, minimumGrade: e.target.value })}
                      placeholder="70"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxInstallments" className="text-white">
                      Número de Parcelas
                    </Label>
                    <Input
                      id="maxInstallments"
                      type="number"
                      value={formData.maxInstallments}
                      onChange={(e) => setFormData({ ...formData, maxInstallments: e.target.value })}
                      placeholder="3"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={updateCourseMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
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
              {isLessonDialogOpen ? (
                <Card className="bg-slate-700 border-slate-600 p-4 mb-4">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {editingLesson ? "Editar Aula" : "Nova Aula"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      console.log('[DEBUG] Form submitted');
                      await handleLessonSubmit();
                    }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lesson-title" className="text-white">
                        Título *
                      </Label>
                      <Input
                        id="lesson-title"
                        value={lessonFormData.title}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                        placeholder="Título da aula"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-type" className="text-white">
                        Tipo de Aula
                      </Label>
                      <Select value={lessonFormData.type} onValueChange={(value: any) => setLessonFormData({ ...lessonFormData, type: value })}>
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

                    {lessonFormData.type === "text" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-content" className="text-white">
                          Conteúdo
                        </Label>
                        <Textarea
                          id="lesson-content"
                          value={lessonFormData.content}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                          placeholder="Conteúdo da aula..."
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={4}
                        />
                      </div>
                    )}

                    {lessonFormData.type === "video" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-video" className="text-white">
                          URL do Vídeo (YouTube)
                        </Label>
                        <Input
                          id="lesson-video"
                          value={lessonFormData.videoUrl}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}

                    {lessonFormData.type === "live" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-live" className="text-white">
                          URL da Aula ao Vivo (Google Meet)
                        </Label>
                        <Input
                          id="lesson-live"
                          value={lessonFormData.liveUrl}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, liveUrl: e.target.value })}
                          placeholder="https://meet.google.com/..."
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                        >
                          {editingLesson ? "Atualizar" : "Criar"} Aula
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsLessonDialogOpen(false);
                            resetLessonForm();
                          }}
                          className="flex-1 bg-slate-600 hover:bg-slate-700"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  onClick={() => {
                    resetLessonForm();
                    setIsLessonDialogOpen(true);
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Aula
                </Button>
              )}

              <div className="space-y-2">
                {lessons && lessons.length > 0 ? (
                  lessons.map((lesson: any) => (
                    <Card key={lesson.id} className="bg-slate-700 border-slate-600">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {lesson.type === "video" ? (
                              <Video className="w-4 h-4 text-cyan-500" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-cyan-500" />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-slate-400">
                                {lesson.type === "text" ? "Texto" : lesson.type === "video" ? "Vídeo" : "Ao Vivo"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditLesson(lesson)}
                              className="text-cyan-500 hover:bg-slate-600"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-500 hover:bg-slate-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma aula criada ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
