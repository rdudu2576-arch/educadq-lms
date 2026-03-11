import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Save, Trash2, Plus } from "lucide-react";


interface ContentItem {
  pageKey: string;
  sectionKey: string;
  contentKey: string;
  content: string;
}

export default function ContentEditor() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState("home");
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [newContent, setNewContent] = useState<ContentItem>({
    pageKey: selectedPage,
    sectionKey: "",
    contentKey: "",
    content: "",
  });

  const { data: pageContent, isLoading, refetch } = trpc.pageContent.getByPage.useQuery(
    { pageKey: selectedPage }
  );

  const updateMutation = trpc.pageContent.update.useMutation({
    onSuccess: () => {
      alert("Conteúdo atualizado com sucesso!");
      refetch();
      setEditingContent(null);
    },
    onError: (error) => {
      alert("Erro ao atualizar conteúdo: " + (error.message || "Erro desconhecido"));
    },
  });

  const deleteMutation = trpc.pageContent.delete.useMutation({
    onSuccess: () => {
      alert("Conteúdo deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      alert("Erro ao deletar conteúdo: " + (error.message || "Erro desconhecido"));
    },
  });

  const handleSave = async () => {
    if (editingContent) {
      await updateMutation.mutateAsync({
        pageKey: editingContent.pageKey,
        sectionKey: editingContent.sectionKey,
        contentKey: editingContent.contentKey,
        content: editingContent.content,
        contentType: "text",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este conteúdo?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const pages = ["home", "sobre", "artigos", "contato"];

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Conteúdo das Páginas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Page Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setSelectedPage(page);
                    setEditingContent(null);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedPage === page
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : pageContent && pageContent.length > 0 ? (
                <div className="space-y-4">
                  {pageContent.map((item: any) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingContent(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">
                  Nenhum conteúdo nesta página
                </p>
              )}
            </CardContent>
          </Card>

          {/* Edit Form */}
          {editingContent && (
            <Card className="border-teal-600 border-2">
              <CardHeader>
                <CardTitle>Editar Conteúdo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seção
                  </label>
                  <Input
                    value={editingContent.sectionKey}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        sectionKey: e.target.value,
                      })
                    }
                    placeholder="Ex: hero, features, footer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chave do Conteúdo
                  </label>
                  <Input
                    value={editingContent.contentKey}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        contentKey: e.target.value,
                      })
                    }
                    placeholder="Ex: title, description, cta_text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Conteúdo
                  </label>
                  <textarea
                    value={editingContent.content}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        content: e.target.value,
                      })
                    }
                    placeholder="Digite o conteúdo aqui..."
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <Save className="w-4 h-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingContent(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
