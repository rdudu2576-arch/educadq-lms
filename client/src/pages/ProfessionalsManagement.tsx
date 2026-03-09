import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Trash2, Edit2, Eye, EyeOff, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function ProfessionalsManagement() {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    publicName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    bio: "",
    professionalBio: "",
    formation: "",
    linkedin: "",
    instagram: "",
    website: "",
    facebook: "",
    youtube: "",
    otherSocial: "",
    professionalEmail: "",
    professionalPhone: "",
    otherContacts: "",
    profileImageUrl: "",
    pixKey: "",
    pixInstructions: "",
    userId: 0,
    level: "",
    score: 0,
  });

  const { data: professionals, isLoading, refetch } =
    trpc.professionals.getAllForAdmin.useQuery(undefined, {
      enabled: user?.role === "admin",
    });

  const createMutation = trpc.professionals.create.useMutation({
    onSuccess: () => {
      toast.success("Profissional criado com sucesso!");
      refetch();
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar profissional: " + error.message);
    },
  });

  const updateMutation = trpc.professionals.update.useMutation({
    onSuccess: () => {
      toast.success("Profissional atualizado com sucesso!");
      refetch();
      setEditingId(null);
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar profissional: " + error.message);
    },
  });

  const deleteMutation = trpc.professionals.delete.useMutation({
    onSuccess: () => {
      toast.success("Profissional deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar profissional: " + error.message);
    },
  });

  const toggleStatusMutation = trpc.professionals.toggleStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      publicName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      bio: "",
      professionalBio: "",
      formation: "",
      linkedin: "",
      instagram: "",
      website: "",
      facebook: "",
      youtube: "",
      otherSocial: "",
      professionalEmail: "",
      professionalPhone: "",
      otherContacts: "",
      profileImageUrl: "",
      pixKey: "",
      pixInstructions: "",
      userId: 0,
      level: "",
      score: 0,
    });
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "userId" || name === "score" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.publicName) {
      toast.error("Nome do profissional é obrigatório");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (professional: any) => {
    setFormData({
      publicName: professional.publicName || "",
      email: professional.email || "",
      phone: professional.phone || "",
      city: professional.city || "",
      state: professional.state || "",
      bio: professional.bio || "",
      professionalBio: professional.professionalBio || "",
      formation: professional.formation || "",
      linkedin: professional.linkedin || "",
      instagram: professional.instagram || "",
      website: professional.website || "",
      facebook: professional.facebook || "",
      youtube: professional.youtube || "",
      otherSocial: professional.otherSocial || "",
      professionalEmail: professional.professionalEmail || "",
      professionalPhone: professional.professionalPhone || "",
      otherContacts: professional.otherContacts || "",
      profileImageUrl: professional.profileImageUrl || "",
      pixKey: professional.pixKey || "",
      pixInstructions: professional.pixInstructions || "",
      userId: professional.userId || 0,
      level: professional.level || "",
      score: professional.score || 0,
    });
    setEditingId(professional.id);
    setShowForm(true);
  };

  if (!user || user.role !== "admin") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">Acesso negado. Apenas administradores podem gerenciar profissionais.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão para abrir formulário */}
      {!showForm && (
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Profissional
        </Button>
      )}

      {/* Formulário Expandido */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId ? "Editar Profissional" : "Criar Novo Profissional"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="identificacao" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-700">
                  <TabsTrigger value="identificacao">Identificação</TabsTrigger>
                  <TabsTrigger value="profissional">Profissional</TabsTrigger>
                  <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
                  <TabsTrigger value="contatos">Contatos</TabsTrigger>
                  <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
                </TabsList>

                {/* TAB 1: Identificação */}
                <TabsContent value="identificacao" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nome do Profissional *
                    </label>
                    <Input
                      type="text"
                      name="publicName"
                      value={formData.publicName}
                      onChange={handleInputChange}
                      placeholder="Ex: Dr. João Silva"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Pessoal
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ex: joao@email.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Telefone Pessoal
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: (41) 98891-3431"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Cidade
                      </label>
                      <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Ex: Curitiba"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Estado
                      </label>
                      <Input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Ex: PR"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      ID do Usuário
                    </label>
                    <Input
                      type="number"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      placeholder="Ex: 1"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      URL da Foto de Perfil
                    </label>
                    <Input
                      type="url"
                      name="profileImageUrl"
                      value={formData.profileImageUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </TabsContent>

                {/* TAB 2: Profissional */}
                <TabsContent value="profissional" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Bio Profissional
                    </label>
                    <Textarea
                      name="professionalBio"
                      value={formData.professionalBio}
                      onChange={handleInputChange}
                      placeholder="Descrição profissional detalhada..."
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Bio Curta
                    </label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Bio curta para cards..."
                      rows={2}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Formação e Cursos
                    </label>
                    <Textarea
                      name="formation"
                      value={formData.formation}
                      onChange={handleInputChange}
                      placeholder="Listar formação, certificações e cursos (um por linha)"
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Nível
                      </label>
                      <Input
                        type="text"
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        placeholder="Ex: avançado"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Pontos
                      </label>
                      <Input
                        type="number"
                        name="score"
                        value={formData.score}
                        onChange={handleInputChange}
                        placeholder="Ex: 850"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* TAB 3: Redes Sociais */}
                <TabsContent value="redes" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      LinkedIn
                    </label>
                    <Input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Instagram
                    </label>
                    <Input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Website
                    </label>
                    <Input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Facebook
                    </label>
                    <Input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      YouTube
                    </label>
                    <Input
                      type="url"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Outras Redes Sociais
                    </label>
                    <Textarea
                      name="otherSocial"
                      value={formData.otherSocial}
                      onChange={handleInputChange}
                      placeholder="Outras redes sociais..."
                      rows={2}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </TabsContent>

                {/* TAB 4: Contatos */}
                <TabsContent value="contatos" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Profissional
                    </label>
                    <Input
                      type="email"
                      name="professionalEmail"
                      value={formData.professionalEmail}
                      onChange={handleInputChange}
                      placeholder="Ex: contato@profissional.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Telefone Profissional
                    </label>
                    <Input
                      type="tel"
                      name="professionalPhone"
                      value={formData.professionalPhone}
                      onChange={handleInputChange}
                      placeholder="Ex: (41) 98891-3431"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Outros Contatos
                    </label>
                    <Textarea
                      name="otherContacts"
                      value={formData.otherContacts}
                      onChange={handleInputChange}
                      placeholder="Outras formas de contato..."
                      rows={3}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </TabsContent>

                {/* TAB 5: Pagamento */}
                <TabsContent value="pagamento" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Chave PIX
                    </label>
                    <Input
                      type="text"
                      name="pixKey"
                      value={formData.pixKey}
                      onChange={handleInputChange}
                      placeholder="Ex: 41 98891-3431"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Instruções de Pagamento
                    </label>
                    <Textarea
                      name="pixInstructions"
                      value={formData.pixInstructions}
                      onChange={handleInputChange}
                      placeholder="Instruções para pagamento via PIX..."
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : editingId ? (
                    "Atualizar"
                  ) : (
                    "Criar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Profissionais */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Profissionais Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : professionals && professionals.length > 0 ? (
            <div className="space-y-3">
              {professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{professional.publicName}</h3>
                    <p className="text-sm text-slate-400">
                      {professional.city && `${professional.city}, ${professional.state}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {professional.professionalBio?.substring(0, 100)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleStatusMutation.mutate({ id: professional.id, active: !professional.isPublic })
                      }
                      title={professional.isPublic ? "Desativar" : "Ativar"}
                    >
                      {professional.isPublic ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(professional)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Tem certeza que deseja deletar ${professional.publicName}?`
                          )
                        ) {
                          deleteMutation.mutate({ id: professional.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              Nenhum profissional cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
