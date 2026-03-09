import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, CheckCircle, Clock, Play, GraduationCap, ShoppingCart, ArrowLeft, Star, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch student enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = trpc.courses.getStudentCourses.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch all available courses
  const { data: allCourses, isLoading: coursesLoading } = trpc.courses.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: !!user }
  );

  // Categorize enrollments
  const { inProgress, completed } = useMemo(() => {
    if (!enrollments) return { inProgress: [], completed: [] };
    return {
      inProgress: enrollments.filter((e: any) => e.status === "active"),
      completed: enrollments.filter((e: any) => e.status === "completed"),
    };
  }, [enrollments]);

  // Find courses not enrolled in
  const availableCourses = useMemo(() => {
    if (!allCourses || !enrollments) return allCourses || [];
    const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));
    return allCourses.filter((c: any) => !enrolledCourseIds.has(c.id));
  }, [allCourses, enrollments]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="pt-6 text-center">
            <GraduationCap className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Acesse sua conta</h2>
            <p className="text-slate-400 mb-6">Faça login para acessar seus cursos e acompanhar seu progresso.</p>
            <Button onClick={() => window.location.href = getLoginUrl()} className="bg-cyan-600 hover:bg-cyan-700">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <SEO title="Meu Dashboard" description="Acompanhe seus cursos em andamento, concluídos e descubra novos cursos." />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Button onClick={() => setLocation("/")} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Início
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Olá, {user.name || "Aluno"}!</h1>
              <p className="text-slate-400 mt-1">Acompanhe seu progresso e continue aprendendo.</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center bg-slate-700/50 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-cyan-400">{inProgress.length}</p>
                <p className="text-xs text-slate-400">Em andamento</p>
              </div>
              <div className="text-center bg-slate-700/50 rounded-lg px-4 py-2">
                <p className="text-2xl font-bold text-green-400">{completed.length}</p>
                <p className="text-xs text-slate-400">Concluídos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {enrollmentsLoading || coursesLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <Tabs defaultValue="in-progress" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="in-progress" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                <Play className="w-4 h-4 mr-2" /> Em Andamento ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <CheckCircle className="w-4 h-4 mr-2" /> Concluídos ({completed.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <ShoppingCart className="w-4 h-4 mr-2" /> Disponíveis ({availableCourses.length})
              </TabsTrigger>
            </TabsList>

            {/* In Progress Tab */}
            <TabsContent value="in-progress">
              {inProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgress.map((enrollment: any) => (
                    <EnrollmentCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      onContinue={() => setLocation(`/courses/${enrollment.courseId}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<BookOpen className="w-12 h-12 text-slate-500" />}
                  title="Nenhum curso em andamento"
                  description="Explore os cursos disponíveis e comece a aprender!"
                  action={<Button onClick={() => setLocation("/")} className="bg-cyan-600 hover:bg-cyan-700">Explorar Cursos</Button>}
                />
              )}
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed">
              {completed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completed.map((enrollment: any) => (
                    <Card key={enrollment.id} className="bg-slate-800 border-green-700/30 hover:border-green-600/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white">Curso #{enrollment.courseId}</CardTitle>
                            <CardDescription className="text-green-400 flex items-center gap-1 mt-1">
                              <CheckCircle className="w-4 h-4" /> Concluído
                            </CardDescription>
                          </div>
                          <GraduationCap className="w-6 h-6 text-green-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress value={100} className="h-2 bg-slate-700" />
                        {enrollment.finalGrade && (
                          <p className="text-sm text-slate-400">
                            Nota final: <span className="text-white font-semibold">{enrollment.finalGrade}</span>
                          </p>
                        )}
                        <Button
                          onClick={() => setLocation(`/courses/${enrollment.courseId}`)}
                          variant="outline"
                          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Revisar Curso
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<GraduationCap className="w-12 h-12 text-slate-500" />}
                  title="Nenhum curso concluído"
                  description="Continue estudando para concluir seus cursos!"
                />
              )}
            </TabsContent>

            {/* Available Courses Tab */}
            <TabsContent value="available">
              {availableCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course: any) => (
                    <Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500/50 transition-colors">
                      {course.coverUrl && (
                        <div className="h-40 overflow-hidden rounded-t-lg">
                          <img src={course.coverUrl} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                        <CardDescription className="text-slate-400 line-clamp-2">
                          {course.description || "Sem descrição"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {course.courseHours}h
                          </span>
                          <Badge variant="outline" className="border-cyan-600 text-cyan-400">
                            R$ {parseFloat(course.price).toFixed(2)}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => setLocation(`/payments?courseId=${course.id}`)}
                          className="w-full bg-cyan-600 hover:bg-cyan-700"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Adquirir Curso
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Star className="w-12 h-12 text-slate-500" />}
                  title="Você já possui todos os cursos!"
                  description="Parabéns! Continue estudando e acompanhe seu progresso."
                />
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Recommendations Section */}
        {availableCourses.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl font-bold text-white">Cursos Recomendados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableCourses.slice(0, 4).map((course: any) => (
                <Card key={course.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/30 transition-colors cursor-pointer" onClick={() => setLocation(`/payments?courseId=${course.id}`)}>
                  <CardContent className="pt-4">
                    <h3 className="text-white font-semibold text-sm mb-1 truncate">{course.title}</h3>
                    <p className="text-xs text-slate-400 mb-2">{course.courseHours}h de conteúdo</p>
                    <p className="text-cyan-400 font-bold text-sm">R$ {parseFloat(course.price).toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
function EnrollmentCard({ enrollment, onContinue }: { enrollment: any; onContinue: () => void }) {
  const progressValue = enrollment.progress || 0;

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white">Curso #{enrollment.courseId}</CardTitle>
            <CardDescription className="text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4" /> Em andamento
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-cyan-600 text-cyan-400">
            {progressValue}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Progresso</span>
            <span className="text-white font-semibold">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2 bg-slate-700" />
        </div>
        <p className="text-xs text-slate-500">
          Matriculado em {new Date(enrollment.enrolledAt).toLocaleDateString("pt-BR")}
        </p>
        <Button onClick={onContinue} className="w-full bg-cyan-600 hover:bg-cyan-700">
          <Play className="w-4 h-4 mr-2" /> Continuar
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{description}</p>
      {action}
    </div>
  );
}
