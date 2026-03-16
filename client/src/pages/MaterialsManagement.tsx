import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Trash2, FileText, ExternalLink, Loader2 } from "lucide-react";

export default function MaterialsManagement() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "link" as "pdf" | "document" | "spreadsheet" | "video" | "link",
  });

  const { data: courses = [] } = trpc.courses.list.useQuery({ limit: 100, offset: 0 });
  
  const { data: lessons = [] } = trpc.lessons.getByCourse.useQuery(
    { courseId: selectedCourse || 0 },
    { enabled: !!selectedCourse }
  );

  const { data: materials = [], refetch: refetchMaterials, isLoading: isLoadingMaterials } = trpc.materials.getLessonMaterials.useQuery(
    { lessonId: selectedLesson || 0 },
    { enabled: !!selectedLesson }
  );

  const addMaterialMutation = trpc.materials.addMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material adicionado com sucesso!");
      setFormData({ title: "", url: "", type: "link" });
      setIsDialogOpen(false);
      refetchMaterials();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const deleteMaterialMutation = trpc.materials.deleteMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material removido com sucesso!");
      refetchMaterials();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.url || !selectedLesson) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    addMaterialMutation.mutate({
      lessonId: selectedLesson,
      title: formData.title,
      url: formData.url,
      type: formData.type,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Gerenciar Materiais</h1>
          <p className="text-slate-400">Adicione materiais complementares às suas aulas</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seleção de Curso e Aula */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-white">Curso</CardTitle></CardHeader>
              <CardContent>
                <Select value={selectedCourse?.toString()} onValueChange={(v) => {
                  setSelectedCourse(parseInt(v));
                  setSelectedLesson(null);
                }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione um curso" /></SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {courses.map((c: any) => <SelectItem key={c.id} value={c.id.toString()} className="text-white">{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCourse && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle className="text-white">Aula</CardTitle></CardHeader>
                <CardContent>
                  <Select value={selectedLesson?.toString()} onValueChange={(v) => setSelectedLesson(parseInt(v))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue placeholder="Selecione uma aula" /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {lessons.map((l: any) => <SelectItem key={l.id} value={l.id.toString()} className="text-white">{l.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lista de Materiais */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {selectedLesson ? "Materiais da Aula" : "Selecione uma aula para ver os materiais"}
              </h2>
              {selectedLesson && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyan-600 hover:bg-cyan-700"><Plus className="w-4 h-4 mr-2" /> Novo Material</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader><DialogTitle className="text-white">Novo Material Complementar</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Título *</Label>
                        <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Apostila PDF" className="bg-slate-700 border-slate-600 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">URL *</Label>
                        <Input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://drive.google.com/..." className="bg-slate-700 border-slate-600 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Tipo</Label>
                        <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="link" className="text-white">Link Externo</SelectItem>
                            <SelectItem value="pdf" className="text-white">PDF</SelectItem>
                            <SelectItem value="document" className="text-white">Documento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSubmit} disabled={addMaterialMutation.isPending} className="w-full bg-cyan-600">Adicionar Material</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-3">
              {!selectedLesson ? (
                <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6 text-center text-slate-400">Selecione uma aula acima</CardContent></Card>
              ) : isLoadingMaterials ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
              ) : materials.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6 text-center text-slate-400">Nenhum material para esta aula</CardContent></Card>
              ) : (
                materials.map((m: any) => (
                  <Card key={m.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-cyan-500" />
                        <div>
                          <h3 className="font-semibold text-white">{m.title}</h3>
                          <p className="text-xs text-slate-400 truncate max-w-md">{m.url}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => window.open(m.url, "_blank")} className="text-white border-slate-600"><ExternalLink className="w-4 h-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMaterialMutation.mutate({ materialId: m.id })} className="bg-red-900"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
