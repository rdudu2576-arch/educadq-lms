import SEO from "@/components/SEO";
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
    // Call all hooks BEFORE any conditional returns
    var _f = trpc.admin.getStatistics.useQuery(undefined, { enabled: !loading && (user === null || user === void 0 ? void 0 : user.role) === "admin" }), stats = _f.data, statsLoading = _f.isLoading;
    var _g = trpc.courses.list.useQuery({ limit: 50, offset: 0 }, { enabled: !loading && (user === null || user === void 0 ? void 0 : user.role) === "admin" }), courses = _g.data, coursesLoading = _g.isLoading;
    // NOW we can do conditional returns
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    if (!user || user.role !== "admin") {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>);
    }
    return (<>
    <SEO title="Painel Administrativo" description="Gerencie cursos, alunos, pagamentos e conteúdos da plataforma EducaDQ."/>
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
                        <p className="text-xs text-slate-400 mt-1">Alunos inscritos</p>
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
                        <p className="text-3xl font-bold text-white">R$ {((stats === null || stats === void 0 ? void 0 : stats.totalRevenue) || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-400 mt-1">Pagamentos realizados</p>
                      </div>
                      <DollarSign className="w-12 h-12 text-green-500 opacity-20"/>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm font-medium">Parcelas Atrasadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-red-500">{(stats === null || stats === void 0 ? void 0 : stats.overdueInstallments) || 0}</p>
                        <p className="text-xs text-slate-400 mt-1">Atenção necessária</p>
                      </div>
                      <AlertCircle className="w-12 h-12 text-red-500 opacity-20"/>
                    </div>
                  </CardContent>
                </Card>
              </div>)}

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Atividade Recente</CardTitle>
                <CardDescription className="text-slate-400">Últimas ações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Novo aluno inscrito</p>
                      <p className="text-xs text-slate-400">Há 2 horas</p>
                    </div>
                    <span className="text-cyan-500">+1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Curso concluído</p>
                      <p className="text-xs text-slate-400">Há 4 horas</p>
                    </div>
                    <span className="text-green-500">✓</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Parcela vencida</p>
                      <p className="text-xs text-slate-400">Há 1 dia</p>
                    </div>
                    <span className="text-red-500">!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Gerenciamento de Cursos</h3>
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={function () { return setLocation("/admin/courses/new"); }}>
                <Plus className="w-4 h-4 mr-2"/>
                Novo Curso
              </Button>
            </div>
            
            <div className="mb-4">
              <input type="text" placeholder="Buscar cursos por nome..." value={courseSearch} onChange={function (e) { return setCourseSearch(e.target.value); }} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"/>
            </div>

            {coursesLoading ? (<div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
              </div>) : courses && courses.length > 0 ? (<div className="space-y-3">
                {courses
                .filter(function (course) {
                return course.title.toLowerCase().includes(courseSearch.toLowerCase());
            })
                .map(function (course) {
                var _a;
                return (<Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{course.title}</h4>
                          <p className="text-sm text-slate-400 mt-1">{(_a = course.description) === null || _a === void 0 ? void 0 : _a.substring(0, 100)}...</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-slate-400">Carga: {course.courseHours}h</span>
                            <span className="text-cyan-500">R$ {parseFloat(course.price.toString()).toFixed(2)}</span>
                            <span className="text-slate-400">Nota Mín: {course.minimumGrade}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={function () { return setLocation("/admin/courses/".concat(course.id, "/edit")); }}>
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-500/10" onClick={function () { return setDeleteConfirm({ open: true, id: course.id }); }}>
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>);
            })}
              </div>) : (<div className="text-center py-12">
                <p className="text-slate-400">Nenhum curso cadastrado.</p>
              </div>)}
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
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <h3 className="text-xl font-bold text-white">Relatórios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors" onClick={function () { return setLocation("/admin/reports/courses"); }}>
                <CardContent className="pt-6">
                  <h4 className="text-white font-semibold mb-2">Relatório de Cursos</h4>
                  <p className="text-sm text-slate-400">Exportar dados de cursos em Excel</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors" onClick={function () { return setLocation("/admin/reports/students"); }}>
                <CardContent className="pt-6">
                  <h4 className="text-white font-semibold mb-2">Relatório de Alunos</h4>
                  <p className="text-sm text-slate-400">Exportar dados de alunos em Excel</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors" onClick={function () { return setLocation("/admin/reports/progress"); }}>
                <CardContent className="pt-6">
                  <h4 className="text-white font-semibold mb-2">Relatório de Progresso</h4>
                  <p className="text-sm text-slate-400">Exportar progresso de alunos em Excel</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors" onClick={function () { return setLocation("/admin/reports/payments"); }}>
                <CardContent className="pt-6">
                  <h4 className="text-white font-semibold mb-2">Relatório de Pagamentos</h4>
                  <p className="text-sm text-slate-400">Exportar dados de pagamentos em Excel</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <ContentEditor />
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
