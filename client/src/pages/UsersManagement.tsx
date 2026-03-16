import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Search, Loader2, Key, UserCheck } from "lucide-react";

export default function UsersManagement() {
  const [selectedTab, setSelectedTab] = useState<"admin" | "professor" | "student">("student");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "professor" | "user",
    password: "",
  });

  const { data: users = [], refetch, isLoading } = trpc.admin.getUsers.useQuery({ limit: 1000, offset: 0 });
  
  const filteredUsers = users.filter((u: any) => {
    const roleMatch = selectedTab === "admin" ? u.role === "admin" : 
                     selectedTab === "professor" ? u.role === "professor" : 
                     u.role === "user";
    const searchMatch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatch && searchMatch;
  });

  const createUserMutation = trpc.admin.createUser.useMutation({
    onSuccess: (data) => {
      toast.success("Usuário criado com sucesso!");
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
        setIsPasswordDialogOpen(true);
      }
      resetForm();
      refetch();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      resetForm();
      refetch();
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const resetPasswordMutation = trpc.admin.resetPassword.useMutation({
    onSuccess: (data) => {
      setTempPassword(data.newPassword);
      setIsPasswordDialogOpen(true);
      toast.success("Senha redefinida!");
    },
    onError: (error: any) => toast.error(`Erro: ${error?.message}`),
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "user", password: "" });
    setEditingId(null);
    setIsUserDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    if (editingId) {
      updateUserMutation.mutate({
        userId: editingId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || undefined,
      });
    } else {
      createUserMutation.mutate({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || undefined,
      });
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      password: "",
    });
    setEditingId(user.id);
    setIsUserDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h2>
            <p className="text-slate-400">Administre o acesso de alunos e professores</p>
          </div>
          <Button onClick={() => { resetForm(); setIsUserDialogOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" /> Novo Usuário
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="admin" className="data-[state=active]:bg-cyan-600">Administradores</TabsTrigger>
            <TabsTrigger value="professor" className="data-[state=active]:bg-cyan-600">Professores</TabsTrigger>
            <TabsTrigger value="student" className="data-[state=active]:bg-cyan-600">Alunos</TabsTrigger>
          </TabsList>

          <div className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por nome ou e-mail..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white" />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 animate-spin text-cyan-500" /></div>
            ) : filteredUsers.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700"><CardContent className="py-12 text-center text-slate-400">Nenhum usuário encontrado</CardContent></Card>
            ) : (
              filteredUsers.map((user: any) => (
                <Card key={user.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="py-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">{user.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)} className="text-white border-slate-600 hover:bg-slate-700"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => resetPasswordMutation.mutate({ userId: user.id })} className="text-cyan-400 border-slate-600 hover:bg-slate-700"><Key className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>

      {/* Dialog de Usuário */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>{editingId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-slate-700 border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-slate-700 border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label>Papel (Role)</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                <SelectTrigger className="bg-slate-700 border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="user">Aluno</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Senha {editingId ? "(deixe em branco para manter)" : "(opcional)"}</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-slate-700 border-slate-600" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="w-full bg-cyan-600">{editingId ? "Salvar Alterações" : "Criar Usuário"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Senha Temporária */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCheck className="text-green-500" /> Senha Gerada</DialogTitle>
            <DialogDescription className="text-slate-400">Anote a senha abaixo, ela não será mostrada novamente.</DialogDescription>
          </DialogHeader>
          <div className="bg-slate-900 p-6 rounded-lg text-center">
            <span className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">{tempPassword}</span>
          </div>
          <Button onClick={() => setIsPasswordDialogOpen(false)} className="w-full bg-cyan-600">Entendido</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
