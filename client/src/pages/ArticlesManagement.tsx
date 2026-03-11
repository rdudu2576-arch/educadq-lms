import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ArticlesManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover: "",
    isPublished: false,
  });

  const { data: articles, isLoading, refetch } = trpc.articles.listAll.useQuery();
  const createMutation = trpc.articles.create.useMutation();
  const updateMutation = trpc.articles.update.useMutation();
  const deleteMutation = trpc.articles.delete.useMutation();

  const handleCreate = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
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
    } catch (error) {
      toast.error("Erro ao criar artigo");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
      });
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
    } catch (error) {
      toast.error("Erro ao atualizar artigo");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este artigo?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Artigo deletado com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar artigo");
    }
  };

  const handleEdit = async (article: any) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || "",
      cover: article.cover || "",
      isPublished: article.isPublished || false,
    });
  };

  const handleCancel = () => {
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      {(isCreating || editingId) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? "Editar Artigo" : "Novo Artigo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Título do artigo"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="url-amigavel-do-artigo"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Conteúdo *</label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Conteúdo do artigo (HTML ou Markdown)"
                rows={8}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Resumo</label>
              <Input
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Resumo do artigo (opcional)"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">URL da Capa</label>
              <Input
                value={formData.cover}
                onChange={(e) =>
                  setFormData({ ...formData, cover: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm text-slate-300">
                Publicado
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingId ? "Atualizar" : "Criar"
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Artigos</h3>
          {!isCreating && !editingId && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Artigo
            </Button>
          )}
        </div>

        {articles && articles.length > 0 ? (
          <div className="grid gap-4">
            {articles.map((article: any) => (
              <Card key={article.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-semibold">{article.title}</h4>
                        <Badge
                          variant={article.isPublished ? "default" : "secondary"}
                          className={
                            article.isPublished
                              ? "bg-green-600"
                              : "bg-slate-600"
                          }
                        >
                          {article.isPublished ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" /> Publicado
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" /> Rascunho
                            </>
                          )}
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
                      <Button
                        onClick={() => handleEdit(article)}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(article.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400">Nenhum artigo criado ainda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
