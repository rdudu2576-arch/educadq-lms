var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Users, Shield, BookOpen, User, Edit2, ChevronUp, ChevronDown, Search, RefreshCw, } from "lucide-react";
export function AdminUserManagement() {
    var _this = this;
    var _a = useState([]), users = _a[0], setUsers = _a[1];
    var _b = useState(null), stats = _b[0], setStats = _b[1];
    var _c = useState("all"), filter = _c[0], setFilter = _c[1];
    var _d = useState(""), search = _d[0], setSearch = _d[1];
    var _e = useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = useState(null), selectedUser = _f[0], setSelectedUser = _f[1];
    var _g = useState(false), showRoleDialog = _g[0], setShowRoleDialog = _g[1];
    var _h = useState(false), showConfirmDialog = _h[0], setShowConfirmDialog = _h[1];
    var _j = useState(""), newRole = _j[0], setNewRole = _j[1];
    var _k = useState(""), reason = _k[0], setReason = _k[1];
    useEffect(function () {
        loadUsers();
        loadStats();
    }, [filter, search]);
    var loadUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockUsers, filtered;
        return __generator(this, function (_a) {
            setIsLoading(true);
            try {
                mockUsers = [
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
                filtered = mockUsers;
                if (filter !== "all") {
                    filtered = filtered.filter(function (u) { return u.role === filter; });
                }
                if (search) {
                    filtered = filtered.filter(function (u) {
                        return u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase());
                    });
                }
                setUsers(filtered);
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockStats;
        return __generator(this, function (_a) {
            try {
                mockStats = {
                    admin: 1,
                    professor: 2,
                    student: 2,
                    total: 5,
                };
                setStats(mockStats);
            }
            catch (error) {
                console.error("Error loading stats:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleRoleChange = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!selectedUser || !newRole)
                return [2 /*return*/];
            try {
                // Chamar API para atualizar papel
                console.log("Changing user ".concat(selectedUser.id, " role to ").concat(newRole));
                console.log("Reason: ".concat(reason));
                // Atualizar lista
                loadUsers();
                loadStats();
                setShowRoleDialog(false);
                setShowConfirmDialog(false);
                setSelectedUser(null);
                setNewRole("");
                setReason("");
            }
            catch (error) {
                console.error("Error changing role:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var getRoleBadge = function (role) {
        var roleConfig = {
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
        var config = roleConfig[role] || roleConfig.user;
        var Icon = config.icon;
        return (<Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3"/>
        {config.label}
      </Badge>);
    };
    var canPromote = function (currentRole) {
        return currentRole !== "admin";
    };
    var canDemote = function (currentRole) {
        return currentRole !== "user";
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-2">Gerencie papéis e permissões de usuários</p>
        </div>
        <Users className="w-8 h-8 text-blue-600"/>
      </div>

      {/* Estatísticas */}
      {stats && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4"/>
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
                <BookOpen className="w-4 h-4"/>
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
                <User className="w-4 h-4"/>
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
        </div>)}

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
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
                <Input placeholder="Nome ou email..." value={search} onChange={function (e) { return setSearch(e.target.value); }} className="pl-8"/>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={loadUsers} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2"/>
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
                {users.map(function (user) { return (<TableRow key={user.id}>
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
                            <Button size="sm" variant="outline" onClick={function () {
                setSelectedUser(user);
                setNewRole(user.role);
            }}>
                              <Edit2 className="w-3 h-3 mr-1"/>
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
                                    {canPromote(user.role) && (<>
                                        {user.role !== "professor" && (<SelectItem value="professor">Professor</SelectItem>)}
                                        {user.role !== "admin" && (<SelectItem value="admin">Administrador</SelectItem>)}
                                      </>)}
                                    {canDemote(user.role) && (<>
                                        {user.role !== "professor" && (<SelectItem value="professor">Professor</SelectItem>)}
                                        {user.role !== "user" && (<SelectItem value="user">Aluno</SelectItem>)}
                                      </>)}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Motivo (opcional)</Label>
                                <Input placeholder="Por que está fazendo essa mudança?" value={reason} onChange={function (e) { return setReason(e.target.value); }} className="mt-1"/>
                              </div>

                              <div className="flex gap-2">
                                <Button onClick={function () {
                setShowConfirmDialog(true);
            }} className="flex-1">
                                  Confirmar
                                </Button>
                                <Button variant="outline" onClick={function () { return setShowRoleDialog(false); }} className="flex-1">
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {canPromote(user.role) && (<Button size="sm" variant="outline" title="Promover" onClick={function () {
                    setSelectedUser(user);
                    setNewRole(user.role === "user" ? "professor" : "admin");
                    setShowConfirmDialog(true);
                }}>
                            <ChevronUp className="w-3 h-3"/>
                          </Button>)}

                        {canDemote(user.role) && (<Button size="sm" variant="outline" title="Rebaixar" onClick={function () {
                    setSelectedUser(user);
                    setNewRole(user.role === "admin" ? "professor" : "user");
                    setShowConfirmDialog(true);
                }}>
                            <ChevronDown className="w-3 h-3"/>
                          </Button>)}
                      </div>
                    </TableCell>
                  </TableRow>); })}
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
              Tem certeza que deseja alterar o papel de {selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name} para{" "}
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
    </div>);
}
