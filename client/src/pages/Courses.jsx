import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { BookOpen, Clock, Award, Search, ArrowLeft, CreditCard } from "lucide-react";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
export default function Courses() {
    var user = useAuth().user;
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = useState(false), showOnlyFree = _c[0], setShowOnlyFree = _c[1];
    var _d = trpc.courses.list.useQuery({ limit: 100, offset: 0 }), courses = _d.data, isLoading = _d.isLoading;
    var filteredCourses = (courses === null || courses === void 0 ? void 0 : courses.filter(function (course) {
        var _a;
        var matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_a = course.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesPrice = !showOnlyFree || parseFloat(course.price || "0") === 0;
        return matchesSearch && matchesPrice;
    })) || [];
    return (<>
      <SEO title="Cursos - EducaDQ" description="Explore nossos cursos especializados em dependência química, prevenção a recaídas e neurociência."/>
      <div className="min-h-screen bg-slate-900">
        {/* Breadcrumbs */}
        <div className="bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 border-b border-teal-700/30">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Cursos" },
        ]}/>
            <button onClick={function () { return setLocation("/", {}); }} className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors text-sm mt-2">
              <ArrowLeft className="w-4 h-4"/>
              Voltar
            </button>
          </div>
        </div>

        {/* Header */}
        <section className="bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 text-white py-12">
          <div className="container max-w-6xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nossos Cursos
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Explore nossa seleção de cursos especializados em dependência química, prevenção a recaídas, neurociência e muito mais.
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="bg-slate-800/50 border-b border-slate-700 py-6">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500"/>
                <Input type="text" placeholder="Buscar cursos..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"/>
              </div>
              <label className="flex items-center gap-2 text-white cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={showOnlyFree} onChange={function (e) { return setShowOnlyFree(e.target.checked); }} className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-teal-600 cursor-pointer"/>
                <span className="text-sm">Apenas Gratuitos</span>
              </label>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="container max-w-6xl mx-auto px-4">
            {isLoading ? (<div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"/>
              </div>) : filteredCourses.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(function (course) {
                var priceNum = parseFloat(course.price || "0");
                var slug = course.slug || course.id;
                return (<Card key={course.id} className="bg-slate-800 border-slate-700 hover:border-teal-600 transition-colors cursor-pointer" onClick={function () { return setLocation("/curso/".concat(slug)); }}>
                      <CardContent className="p-0">
                        {/* Course Image */}
                        <div className="relative aspect-video bg-slate-700 overflow-hidden rounded-t-lg">
                          {course.coverUrl ? (<img src={course.coverUrl} alt={course.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>) : (<div className="w-full h-full bg-gradient-to-br from-teal-800 to-teal-600 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-white/40"/>
                            </div>)}
                          <Badge className="absolute top-3 right-3 bg-teal-600/90 text-white border-0">
                            {course.courseHours}h
                          </Badge>
                        </div>

                        {/* Course Info */}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-teal-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          {/* Course Meta */}
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-teal-400"/>
                              {course.courseHours}h
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-teal-400"/>
                              Certificado
                            </div>
                          </div>

                          {/* Price and Button */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-teal-400 font-bold text-lg">
                                R$ {priceNum.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={function (e) {
                        e.stopPropagation();
                        if (!user) {
                            window.location.href = getLoginUrl();
                        }
                        else {
                            setLocation("/checkout/".concat(course.id));
                        }
                    }}>
                              <CreditCard className="w-4 h-4 mr-1"/>
                              Matricular
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>);
            })}
              </div>) : (<div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-slate-600 mb-4"/>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-slate-400">
                  Tente buscar com outros termos ou volte mais tarde.
                </p>
              </div>)}
          </div>
        </section>
      </div>
    </>);
}
