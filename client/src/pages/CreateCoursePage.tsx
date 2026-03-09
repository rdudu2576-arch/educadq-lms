import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "live";
  content: string;
  videoUrl?: string;
  liveUrl?: string;
  order: number;
}

export default function CreateCoursePage() {
  const [, setLocation] = useLocation();
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    minimumGrade: "60",
    maxInstallments: "3",
    coverImage: "",
    trailerUrl: "",
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const createCourseMutation = trpc.courses.create.useMutation({
    onSuccess: () => {
      toast.success("Curso criado com sucesso!");
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar curso: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "",
      type: "text",
      content: "",
      order: lessons.length + 1,
    };
    setLessons([...lessons, newLesson]);
    const newExpanded = new Set(expandedLessons);
    newExpanded.add(newLesson.id);
    setExpandedLessons(newExpanded);
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id));
    const updated = new Set(expandedLessons);
    updated.delete(id);
    setExpandedLessons(updated);
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons(
      lessons.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const toggleLessonExpand = (id: string) => {
    const updated = new Set(expandedLessons);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setExpandedLessons(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Preencha todos os campos obrigatórios do curso");
      return;
    }

    if (lessons.length === 0) {
      toast.error("Adicione pelo menos uma aula ao curso");
      return;
    }

    // Validate all lessons
    for (const lesson of lessons) {
      if (!lesson.title) {
        toast.error("Todas as aulas devem ter um título");
        return;
      }
      if (!lesson.content && lesson.type === "text") {
        toast.error("Aulas de texto devem ter conteúdo");
        return;
      }
      if (!lesson.videoUrl && lesson.type === "video") {
        toast.error("Aulas de vídeo devem ter uma URL");
        return;
      }
      if (!lesson.liveUrl && lesson.type === "live") {
        toast.error("Aulas ao vivo devem ter uma URL do Google Meet");
        return;
      }
    }

    createCourseMutation.mutate({
      title: formData.title,
      description: formData.description,
      courseHours: parseInt(formData.duration) || 0,
      price: formData.price || "0",
      minimumGrade: parseInt(formData.minimumGrade) || 60,
      maxInstallments: parseInt(formData.maxInstallments) || 1,
      coverUrl: formData.coverImage || "",
      trailerUrl: formData.trailerUrl || "",
      professorId: 1,
      lessons: lessons.map((l) => ({
        title: l.title,
        type: l.type,
        content: l.content,
        videoUrl: l.videoUrl,
        liveUrl: l.liveUrl,
        order: l.order,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Novo Curso</h1>
          <p className="text-slate-400">Crie um novo curso com suas aulas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informações do Curso</CardTitle>
              <CardDescription className="text-slate-400">
                Preencha os dados básicos do curso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                  Título do Curso *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Introdução a Python"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o conteúdo e objetivos do curso"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-32"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">
                    Carga Horária (horas) *
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="Ex: 40"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">
                    Valor (R$) *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Ex: 199.90"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minGrade" className="text-white">
                    Nota Mínima (%)
                  </Label>
                  <Input
                    id="minGrade"
                    name="minGrade"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.minimumGrade}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxInstallments" className="text-white">
                    Máx. Parcelas
                  </Label>
                  <Input
                    id="maxInstallments"
                    name="maxInstallments"
                    type="number"
                    min="1"
                    value={formData.maxInstallments}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-white">
                  URL da Capa
                </Label>
                <Input
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailerUrl" className="text-white">
                  URL do Trailer (YouTube)
                </Label>
                <Input
                  id="trailerUrl"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Aulas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Aulas ({lessons.length})</CardTitle>
                <CardDescription className="text-slate-400">
                  Adicione as aulas do curso
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={addLesson}
                className="bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Aula
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessons.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Nenhuma aula adicionada. Clique em "Adicionar Aula" para começar.
                </p>
              ) : (
                lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-slate-700 rounded-lg border border-slate-600">
                    <button
                      type="button"
                      onClick={() => toggleLessonExpand(lesson.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {expandedLessons.has(lesson.id) ? (
                          <ChevronUp className="w-5 h-5 text-cyan-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-cyan-500" />
                        )}
                        <div className="text-left">
                          <p className="text-white font-medium">
                            Aula {lesson.order}: {lesson.title || "Sem título"}
                          </p>
                          <p className="text-sm text-slate-400">
                            Tipo: {lesson.type === "video" ? "Vídeo" : lesson.type === "live" ? "Ao Vivo" : "Texto"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLesson(lesson.id);
                        }}
                        className="text-red-500 hover:text-red-400 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </button>

                    {expandedLessons.has(lesson.id) && (
                      <div className="border-t border-slate-600 p-4 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Título da Aula *</Label>
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                            placeholder="Ex: Introdução ao Python"
                            className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Tipo de Aula *</Label>
                          <select
                            value={lesson.type}
                            onChange={(e) =>
                              updateLesson(lesson.id, { type: e.target.value as "video" | "text" | "live" })
                            }
                            className="w-full bg-slate-600 border border-slate-500 text-white rounded px-3 py-2"
                          >
                            <option value="text">Texto</option>
                            <option value="video">Vídeo (YouTube)</option>
                            <option value="live">Ao Vivo (Google Meet)</option>
                          </select>
                        </div>

                        {lesson.type === "text" && (
                          <div className="space-y-2">
                            <Label className="text-white">Conteúdo *</Label>
                            <Textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(lesson.id, { content: e.target.value })}
                              placeholder="Digite o conteúdo da aula..."
                              className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 min-h-32"
                            />
                          </div>
                        )}

                        {lesson.type === "video" && (
                          <div className="space-y-2">
                            <Label className="text-white">URL do Vídeo (YouTube) *</Label>
                            <Input
                              value={lesson.videoUrl || ""}
                              onChange={(e) => updateLesson(lesson.id, { videoUrl: e.target.value })}
                              placeholder="https://youtube.com/watch?v=..."
                              className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                            />
                          </div>
                        )}

                        {lesson.type === "live" && (
                          <div className="space-y-2">
                            <Label className="text-white">URL do Google Meet *</Label>
                            <Input
                              value={lesson.liveUrl || ""}
                              onChange={(e) => updateLesson(lesson.id, { liveUrl: e.target.value })}
                              placeholder="https://meet.google.com/..."
                              className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1"
            >
              {createCourseMutation.isPending ? "Criando..." : "Criar Curso"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin")}
              className="text-white border-slate-600 hover:bg-slate-700 flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
