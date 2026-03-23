import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, BookOpen, DollarSign, AlertCircle, Plus, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UsersManagement from "./UsersManagement";
import PaymentsManagement from "./PaymentsManagement";
import ArticlesManagement from "./ArticlesManagement";
import ContentEditor from "./ContentEditor";
import ProfessionalsManagement from "./ProfessionalsManagement";

export default function AdminDashboard() {
    var _a = useAuth(), user = _a.user, loading = _a.loading, logout = _a.logout;
    var _b = useLocation(), setLocation = _b[1];
    var _c = useState("overview"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = useState(""), courseSearch = _d[0], setCourseSearch = _d[1];
    var _e = useState({
        open: false,
        id: null,
    }), deleteConfirm = _e[0], setDeleteConfirm = _e[1];
    
    // Verificar se o usuário é admin ou desenvolvedor
    const isAdminOrDev = user && (user.role === "admin" || user.role === "desenvolvedor");
    
    // Call all hooks BEFORE any conditional returns
    var _f = trpc.admin.getStatistics.useQuery(undefined, { enabled: !loading && isAdminOrDev }), stats = _f.data, statsLoading = _f.isLoading;
    var _g = trpc.courses.list.useQuery({ limit: 50, offset: 0 }, { enabled: !loading && isAdminOrDev }), courses = _g.data, coursesLoading = _g.isLoading;
    
    // NOW we can do conditional returns
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    
    if (!user || !isAdminOrDev) {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>);
    }
    
    return (<>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
              <p className="text-slate-400">Gerenciamento completo da plataforma</p>
              {user && (<p className="text-sm text-slate-500 mt-2">
                  👤 Logado como: <span className="text-cyan-400 font-semibold">{user.name || user.email}</span>
                </p>)}
            </div>
            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={function () { return setLocation("/admin/courses/new"); }}>
                <Plus className="w-4 h-4 mr-2"/>
                Novo Curso
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2"/>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="courses" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Cursos</TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Usuários</TabsTrigger>
            <TabsTrigger value="payments" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Pagamentos</TabsTrigger>
            <TabsTrigger value="articles" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Artigos</TabsTrigger>
            <TabsTrigger value="content" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Conteúdo</TabsTrigger>
            <TabsTrigger value="reports" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Relatórios</TabsTrigger>
            <TabsTrigger value="professionals" className="text-white data-[state=active]:bg-cyan-600 data-[state=inactive]:text-white">Profissionais</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {statsLoading ? (<div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
              </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm font-medium">Total de Cursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">{(stats === null || stats === void 0 ? void 0 : stats.totalCourses) || 0}</p>
                        <p className="text-xs text-slate-400 mt-1">Cursos cadastrados</p>
                      </div>
                      <BookOpen className="w-12 h-12 text-cyan-500 opacity-20"/>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm font-medium">Total de Alunos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">{(stats === null || stats === void 0 ? void 0 : stats.totalStudents) || 0}</p>
                        <p className="text-xs text-slate-400 mt-1">Alunos ativos</p>
                      </div>
                      <Users className="w-12 h-12 text-cyan-500 opacity-20"/>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm font-medium">Receita Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">R$ {(stats === null || stats === void 0 ? void 0 : stats.totalRevenue) || 0}</p>
                        <p className="text-xs text-slate-400 mt-1">Faturamento</p>
                      </div>
                      <DollarSign className="w-12 h-12 text-cyan-500 opacity-20"/>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm font-medium">Taxa de Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">{(stats === null || stats === void 0 ? void 0 : stats.completionRate) || 0}%</p>
                        <p className="text-xs text-slate-400 mt-1">Média de conclusão</p>
                      </div>
                      <AlertCircle className="w-12 h-12 text-cyan-500 opacity-20"/>
                    </div>
                  </CardContent>
                </Card>
              </div>)}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6 mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gerenciar Cursos</CardTitle>
                <CardDescription className="text-slate-400">Lista de todos os cursos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (<div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
                  </div>) : (<div className="space-y-4">
                    <p className="text-slate-400">Total de cursos: {courses?.length || 0}</p>
                  </div>)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <UsersManagement />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6 mt-6">
            <PaymentsManagement />
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6 mt-6">
            <ArticlesManagement />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <ContentEditor />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Relatórios</CardTitle>
                <CardDescription className="text-slate-400">Gerar e visualizar relatórios</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Módulo de relatórios em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6 mt-6">
            <ProfessionalsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>);
}
