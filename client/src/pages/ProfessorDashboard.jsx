import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Users, BarChart3, Plus, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
export default function ProfessorDashboard() {
    var _a = useAuth(), user = _a.user, loading = _a.loading, logout = _a.logout;
    var _b = useLocation(), setLocation = _b[1];
    var _c = useState("courses"), activeTab = _c[0], setActiveTab = _c[1];
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    if (!user || user.role !== "professor") {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Acesso negado. Apenas professores podem acessar esta página.</p>
      </div>);
    }
    // Fetch professor's courses
    var _d = trpc.courses.getByProfessor.useQuery({ professorId: (user === null || user === void 0 ? void 0 : user.id) || 0 }, { enabled: !!user }), courses = _d.data, coursesLoading = _d.isLoading;
    return (<>
    <SEO title="Painel do Professor" description="Gerencie seus cursos, aulas e acompanhe o desempenho dos alunos."/>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Painel do Professor</h1>
              <p className="text-slate-400">Gerenciamento de cursos e aulas</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={function () { return setLocation("/professor/lessons/new"); }}>
                <Plus className="w-4 h-4 mr-2"/>
                Nova Aula
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
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="courses" className="data-[state=active]:bg-cyan-600">Meus Cursos</TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-cyan-600">Alunos</TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-cyan-600">Avaliações</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Meus Cursos</h3>
            </div>

            {coursesLoading ? (<div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
              </div>) : courses && courses.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(function (course) {
                var _a;
                return (<Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white">{course.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {(_a = course.description) === null || _a === void 0 ? void 0 : _a.substring(0, 80)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Carga Horária</p>
                          <p className="text-white font-semibold">{course.courseHours}h</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Valor</p>
                          <p className="text-cyan-500 font-semibold">R$ {parseFloat(course.price.toString()).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={function () { return setLocation("/professor/courses/".concat(course.id, "/lessons")); }}>
                          <BookOpen className="w-4 h-4 mr-2"/>
                          Aulas
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={function () { return setLocation("/professor/courses/".concat(course.id, "/students")); }}>
                          <Users className="w-4 h-4 mr-2"/>
                          Alunos
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={function () { return setLocation("/professor/courses/".concat(course.id, "/analytics")); }}>
                          <BarChart3 className="w-4 h-4 mr-2"/>
                          Análise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>);
            })}
              </div>) : (<div className="text-center py-12">
                <p className="text-slate-400">Você não está atribuído a nenhum curso.</p>
              </div>)}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6 mt-6">
            <h3 className="text-xl font-bold text-white">Acompanhamento de Alunos</h3>
            {courses && courses.length > 0 ? (<div className="space-y-4">
                {courses.map(function (course) { return (<Card key={course.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 mb-4">Clique para ver detalhes dos alunos</p>
                      <Button variant="outline" className="w-full" onClick={function () { return setLocation("/professor/courses/".concat(course.id, "/students")); }}>
                        <Users className="w-4 h-4 mr-2"/>
                        Ver Alunos
                      </Button>
                    </CardContent>
                  </Card>); })}
              </div>) : (<Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">Nenhum curso atribuído.</p>
                </CardContent>
              </Card>)}
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Avaliações</h3>
              <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={function () { return setLocation("/professor/assessments/new"); }}>
                <Plus className="w-4 h-4 mr-2"/>
                Nova Avaliação
              </Button>
            </div>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400">Interface de gerenciamento de avaliações em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>);
}
