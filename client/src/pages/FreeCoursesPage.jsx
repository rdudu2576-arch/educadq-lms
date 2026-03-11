import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
export function FreeCoursesPage() {
    var _a = useLocation(), navigate = _a[1];
    var _b = trpc.courses.getFreeCourses.useQuery({
        limit: 20,
        offset: 0,
    }), courses = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando cursos gratuitos...</div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Cursos Gratuitos</h1>
          <p className="text-cyan-100 text-lg">
            Acesse cursos de qualidade sem custo. Comece sua jornada de aprendizado agora!
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {courses && courses.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(function (course) { return (<Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-cyan-600 transition-all">
                {course.coverUrl && (<img src={course.coverUrl} alt={course.title} className="w-full h-48 object-cover rounded-t-lg"/>)}
                <CardHeader>
                  <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {course.courseHours || 0} horas de conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-sm line-clamp-3">{course.description}</p>
                  <div className="flex gap-2">
                    <Button onClick={function () { return navigate("/curso/".concat(course.slug || course.id)); }} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                      Ver Curso
                    </Button>
                    <Button variant="outline" className="flex-1 border-cyan-600 text-cyan-400 hover:bg-cyan-600/10">
                      Grátis
                    </Button>
                  </div>
                </CardContent>
              </Card>); })}
          </div>) : (<div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">Nenhum curso gratuito disponível no momento.</p>
            <Button onClick={function () { return navigate("/cursos"); }} className="bg-cyan-600 hover:bg-cyan-700">
              Ver Todos os Cursos
            </Button>
          </div>)}
      </div>
    </div>);
}
