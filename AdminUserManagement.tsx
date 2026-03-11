import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Shield,
  BookOpen,
  User,
  Edit2,
  ChevronUp,
  ChevronDown,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";

export function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [filter, search]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      const mockUsers = [
        {
          id: 1,
          name: "Antonio Conforti",
          email: "antonio@educadq.com",
          role: "admin",
          createdAt: new Date("2024-01-15"),
        },
        {
          id: 2,
          name: "João Professor",
          email: "joao@educadq.com",
          role: "professor",
          createdAt: new Date("2024-02-01"),
        },
        {
          id: 3,
          name: "Maria Silva",
          email: "maria@educadq.com",
          role: "user",
          createdAt: new Date("2024-02-10"),
        },
        {
          id: 4,
          name: "Pedro Santos",
          email: "pedro@educadq.com",
          role: "user",
          createdAt: new Date("2024-02-15"),
        },
        {
          id: 5,
          name: "Ana Costa",
          email: "ana@educadq.com",
          role: "professor",
          createdAt: new Date("2024-02-20"),
        },
      ];

      let filtered = mockUsers;

      if (filter !== "all") {
        filtered = filtered.filter((u) => u.role === filter);
      }

      if (search) {
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      setUsers(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simular carregamento de estatísticas
      const mockStats = {
        admin: 1,
        professor: 2,
        student: 2,
        total: 5,
      };

      setStats(mockStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      // Chamar API para atualizar papel
      console.log(`Changing user ${selectedUser.id} role to ${newRole}`);
      console.log(`Reason: ${reason}`);

      // Atualizar lista
      loadUsers();
      loadStats();

      setShowRoleDialog(false);
      setShowConfirmDialog(false);
      setSelectedUser(null);
      setNewRole("");
      setReason("");
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<
      string,
      { label: string; variant: string; icon: any; color: string }
    > = {
      admin: {
        label: "Administrador",
        variant: "default",
        icon: Shield,
        color: "bg-red-100 text-red-800",
      },
      professor: {
        label: "Professor",
        variant: "secondary",
        icon: BookOpen,
        color: "bg-blue-100 text-blue-800",
      },
      user: {
        label: "Aluno",
        variant: "outline",
        icon: User,
        color: "bg-green-100 text-green-800",
      },
    };

    const config = roleConfig[role] || roleConfig.user;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const canPromote = (currentRole: string): boolean => {
    return currentRole !== "admin";
  };

  const canDemote = (currentRole: string): boolean => {
    return currentRole !== "user";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-2">Gerencie papéis e permissões de usuários</p>
        </div>
        <Users className="w-8 h-8 text-blue-600" />
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admin}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Professores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.professor}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.student}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Papel</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="user">Aluno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={loadUsers} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>{users.length} usuários encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                              }}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Alterar Papel
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Alterar Papel de Usuário</DialogTitle>
                              <DialogDescription>
                                Altere o papel de {user.name}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <Label>Papel Atual</Label>
                                <div className="mt-2">{getRoleBadge(user.role)}</div>
                              </div>

                              <div>
                                <Label>Novo Papel</Label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {canPromote(user.role) && (
                                      <>
                                        {user.role !== "professor" && (
                                          <SelectItem value="professor">Professor</SelectItem>
                                        )}
                                        {user.role !== "admin" && (
                                          <SelectItem value="admin">Administrador</SelectItem>
                                        )}
                                      </>
                                    )}
                                    {canDemote(user.role) && (
                                      <>
                                        {user.role !== "professor" && (
                                          <SelectItem value="professor">Professor</SelectItem>
                                        )}
                                        {user.role !== "user" && (
                                          <SelectItem value="user">Aluno</SelectItem>
                                        )}
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Motivo (opcional)</Label>
                                <Input
                                  placeholder="Por que está fazendo essa mudança?"
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setShowConfirmDialog(true);
                                  }}
                                  className="flex-1"
                                >
                                  Confirmar
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowRoleDialog(false)}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {canPromote(user.role) && (
                          <Button
                            size="sm"
                            variant="outline"
                            title="Promover"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role === "user" ? "professor" : "admin");
                              setShowConfirmDialog(true);
                            }}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                        )}

                        {canDemote(user.role) && (
                          <Button
                            size="sm"
                            variant="outline"
                            title="Rebaixar"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role === "admin" ? "professor" : "user");
                              setShowConfirmDialog(true);
                            }}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Mudança de Papel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar o papel de {selectedUser?.name} para{" "}
              <strong>
                {newRole === "admin"
                  ? "Administrador"
                  : newRole === "professor"
                    ? "Professor"
                    : "Aluno"}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleRoleChange}>Confirmar</AlertDialogAction>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
