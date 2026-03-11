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
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Search } from "lucide-react";
export default function UsersManagement() {
    var _a = useState("student"), selectedTab = _a[0], setSelectedTab = _a[1];
    var _b = useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState(false), isOpen = _c[0], setIsOpen = _c[1];
    var _d = useState(null), editingId = _d[0], setEditingId = _d[1];
    var _e = useState({
        name: "",
        email: "",
        role: "user",
    }), formData = _e[0], setFormData = _e[1];
    var _f = trpc.admin.getUsers.useQuery({ limit: 1000, offset: 0 }), _g = _f.data, users = _g === void 0 ? [] : _g, refetch = _f.refetch;
    var utils = trpc.useUtils();
    // Filter users by role
    var adminUsers = users.filter(function (u) { return u.role === "admin"; });
    var professorUsers = users.filter(function (u) { return u.role === "professor"; });
    var studentUsers = users.filter(function (u) { return u.role === "user"; });
    // Get current tab users
    var currentUsers = {
        admin: adminUsers,
        professor: professorUsers,
        student: studentUsers,
    }[selectedTab];
    // Filter by search query
    var filteredUsers = currentUsers.filter(function (u) {
        return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
    });
    var createUserMutation = trpc.admin.createUser.useMutation({
        onSuccess: function () {
            toast.success("Usuário criado com sucesso!");
            resetForm();
            refetch();
        },
        onError: function (error) { return toast.error("Erro: ".concat((error === null || error === void 0 ? void 0 : error.message) || 'Erro desconhecido')); },
    });
    var updateUserMutation = trpc.admin.updateUserRole.useMutation({
        onSuccess: function () {
            toast.success("Usuário atualizado com sucesso!");
            resetForm();
            refetch();
            utils.auth.me.invalidate();
        },
        onError: function (error) { return toast.error("Erro: ".concat((error === null || error === void 0 ? void 0 : error.message) || 'Erro desconhecido')); },
    });
    var deleteUserMutation = trpc.admin.deleteUser.useMutation({
        onSuccess: function () {
            toast.success("Usuário deletado com sucesso!");
            refetch();
        },
        onError: function (error) { return toast.error("Erro: ".concat((error === null || error === void 0 ? void 0 : error.message) || 'Erro desconhecido')); },
    });
    var resetForm = function () {
        setFormData({ name: "", email: "", role: "user" });
        setEditingId(null);
        setIsOpen(false);
    };
    var handleSubmit = function () {
        if (!formData.name || !formData.email) {
            toast.error("Preencha todos os campos");
            return;
        }
        if (editingId) {
            updateUserMutation.mutate({
                userId: editingId,
                role: formData.role,
            });
        }
        else {
            createUserMutation.mutate({
                name: formData.name,
                email: formData.email,
                role: formData.role,
            });
        }
    };
    var handleEdit = function (user) {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "user",
        });
        setEditingId(user.id);
        setIsOpen(true);
    };
    var getRoleLabel = function (role) {
        var labels = {
            admin: "Administrador",
            professor: "Professor",
            user: "Aluno",
        };
        return labels[role] || role;
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h2>
          <p className="text-slate-400">Gerencie administradores, professores e alunos</p>
        </div>
        <Button onClick={function () {
            resetForm();
            setIsOpen(true);
        }} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2"/>
          Novo Usuário
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={function (v) { return setSelectedTab(v); }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="admin" className="data-[state=active]:bg-cyan-600">
            Administradores ({adminUsers.length})
          </TabsTrigger>
          <TabsTrigger value="professor" className="data-[state=active]:bg-cyan-600">
            Professores ({professorUsers.length})
          </TabsTrigger>
          <TabsTrigger value="student" className="data-[state=active]:bg-cyan-600">
            Alunos ({studentUsers.length})
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
            <Input placeholder="Buscar por nome ou email..." value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} className="pl-10 bg-slate-700 border-slate-600 text-white"/>
          </div>
        </div>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-4 mt-6">
          {filteredUsers.length === 0 ? (<Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center text-slate-400">
                Nenhum administrador encontrado
              </CardContent>
            </Card>) : (filteredUsers.map(function (user) { return (<Card key={user.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-red-900 text-red-200 rounded-full text-xs font-medium">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={function () { return handleEdit(user); }} className="text-white border-slate-600 hover:bg-slate-700">
                        <Edit2 className="w-4 h-4"/>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={function () { return deleteUserMutation.mutate({ userId: user.id }); }} className="bg-red-900 hover:bg-red-800">
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>); }))}
        </TabsContent>

        {/* Professor Tab */}
        <TabsContent value="professor" className="space-y-4 mt-6">
          {filteredUsers.length === 0 ? (<Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center text-slate-400">
                Nenhum professor encontrado
              </CardContent>
            </Card>) : (filteredUsers.map(function (user) { return (<Card key={user.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs font-medium">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={function () { return handleEdit(user); }} className="text-white border-slate-600 hover:bg-slate-700">
                        <Edit2 className="w-4 h-4"/>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={function () { return deleteUserMutation.mutate({ userId: user.id }); }} className="bg-red-900 hover:bg-red-800">
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>); }))}
        </TabsContent>

        {/* Student Tab */}
        <TabsContent value="student" className="space-y-4 mt-6">
          {filteredUsers.length === 0 ? (<Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center text-slate-400">
                Nenhum aluno encontrado
              </CardContent>
            </Card>) : (filteredUsers.map(function (user) { return (<Card key={user.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-green-900 text-green-200 rounded-full text-xs font-medium">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={function () { return handleEdit(user); }} className="text-white border-slate-600 hover:bg-slate-700">
                        <Edit2 className="w-4 h-4"/>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={function () { return deleteUserMutation.mutate({ userId: user.id }); }} className="bg-red-900 hover:bg-red-800">
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>); }))}
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingId ? "Atualize os dados do usuário" : "Crie um novo usuário"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Nome
              </Label>
              <Input id="name" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} placeholder="Nome completo" className="bg-slate-700 border-slate-600 text-white" disabled={!!editingId}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input id="email" type="email" value={formData.email} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { email: e.target.value })); }} placeholder="email@exemplo.com" className="bg-slate-700 border-slate-600 text-white" disabled={!!editingId}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">
                Função
              </Label>
              <Select value={formData.role} onValueChange={function (role) { return setFormData(__assign(__assign({}, formData), { role: role })); }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="admin" className="text-white">Administrador</SelectItem>
                  <SelectItem value="professor" className="text-white">Professor</SelectItem>
                  <SelectItem value="user" className="text-white">Aluno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={createUserMutation.isPending || updateUserMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="text-white border-slate-600 hover:bg-slate-700">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);
}
