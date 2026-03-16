import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Play, Users, Award, BookOpen, Clock,
  ChevronLeft, ChevronRight, ArrowRight, FileText,
  GraduationCap, ShieldCheck, Star
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { useRef, useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLocation, Link } from "wouter";
import ProfessionalsSection from "@/components/ProfessionalsSection";

function CourseCarousel({ courses, title }: { courses: any[]; title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!courses || courses.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-white mb-6 px-4">{title}</h3>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-slate-900/90 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {courses.map((course) => {
            const priceNum = parseFloat(course.price || "0");
            const slug = course.slug || course.id;
            return (
              <div
                key={course.id}
                className="flex-shrink-0 w-[280px] group/card cursor-pointer"
                onClick={() => setLocation(`/curso/${slug}`)}
              >
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-slate-700">
                  {course.coverUrl ? (
                    <img
                      src={course.coverUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-800 to-teal-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-2">
                      <Play className="w-8 h-8 text-white fill-white" />
                      <span className="text-white text-sm font-medium">Ver detalhes</span>
                    </div>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-teal-600/90 text-white border-0">
                    {course.courseHours}h
                  </Badge>
                </div>
                <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover/card:text-teal-400 transition-colors">
                  {course.title}
                </h4>
                <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 font-bold text-sm">
                    R$ {priceNum.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-slate-900/90 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: courses, isLoading: coursesLoading } = trpc.courses.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: freeCourses } = trpc.courses.getFreeCourses.useQuery({
    limit: 20,
    offset: 0,
  });

  const { data: articles } = trpc.articles.list.useQuery();

  return (
    <div className="min-h-screen bg-slate-900">
      <SEO title="EducaDQ - Plataforma EAD" description="Cursos online especializados em dependência química, prevenção a recaídas e neurociência. Estude no seu ritmo, de qualquer lugar." />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <img 
              src="/assets/logo_escuro_turquesa.png" 
              alt="EducaDQ Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.querySelector('.logo-fallback')?.classList.remove('hidden');
              }}
            />
            <div className="logo-fallback hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">EducaDQ</h1>
                <p className="text-[10px] text-slate-500 leading-tight">Plataforma EAD</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#courses" className="text-slate-300 hover:text-teal-400 transition-colors">Cursos</a>
            <Link href="/cursos-gratuitos" className="text-slate-300 hover:text-teal-400 transition-colors">Grátis</Link>
            <Link href="/artigos" className="text-slate-300 hover:text-teal-400 transition-colors">Artigos</Link>
            <a href="#about" className="text-slate-300 hover:text-teal-400 transition-colors">Sobre</a>
            <a href="https://wa.me/5541988913431" target="_blank" className="text-slate-300 hover:text-teal-400 transition-colors">Contato</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-slate-400 text-sm hidden sm:inline">{user?.name}</span>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    if (user?.role === "admin") setLocation("/admin");
                    else if (user?.role === "professor") setLocation("/professor");
                    else setLocation("/student");
                  }}
                >
                  Meu Painel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => setLocation("/login")}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-800/20 via-transparent to-transparent" />
        <div className="relative container max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 mb-6">
              Centro de Formação e Estudos sobre Álcool e outras Drogas
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transforme sua carreira com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                conhecimento especializado
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl">
              O conhecimento salva vidas. Formações especializadas em dependência química, prevenção a recaídas, codependência e neurociência. Estude no seu ritmo, de qualquer lugar, com os melhores profissionais da área.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                onClick={() => setLocation("/cursos")}
              >
                Explorar Cursos <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => setLocation("/login")}
                >
                  Criar Conta Gratuita
                </Button>
              )}
            </div>
          </div>

          {/* Stats inline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: BookOpen, label: "Cursos", value: courses?.length || 0 },
              { icon: Users, label: "Alunos", value: "500+" },
              { icon: Award, label: "Certificados", value: "200+" },
              { icon: ShieldCheck, label: "Aprovação", value: "95%" },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section - Netflix Style */}
      <section id="courses" className="py-12">
        <div className="container max-w-7xl mx-auto">
          {coursesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : courses && courses.length > 0 ? (
            <>
              {freeCourses && freeCourses.length > 0 && (
                <CourseCarousel courses={freeCourses} title="🎓 Cursos Gratuitos - Comece Agora!" />
              )}
              <CourseCarousel courses={courses} title="Cursos em Destaque" />
              {courses.length > 3 && (
                <CourseCarousel courses={[...courses].reverse()} title="Mais Populares" />
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Novos cursos em breve.</p>
            </div>
          )}
        </div>
      </section>

      {/* Articles Section */}
      {articles && articles.length > 0 && (
        <section className="py-12 bg-slate-800/30">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">Artigos e Pesquisas</h3>
              <Link href="/artigos">
                <Button variant="ghost" className="text-teal-400 hover:text-teal-300">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article: any) => (
                <Link key={article.id} href={`/artigos/${article.slug}`}>
                  <Card className="bg-slate-800 border-slate-700 hover:border-teal-500/50 transition-colors cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-teal-500" />
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {article.category || "Artigo"}
                        </Badge>
                      </div>
                      <h4 className="text-white font-semibold mb-2 line-clamp-2">{article.title}</h4>
                      <p className="text-slate-400 text-sm line-clamp-3">{article.summary}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-white text-center mb-12">O que dizem nossos alunos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Maria S.", role: "Psicóloga", text: "Conteúdo excelente e muito bem estruturado. Mudou minha forma de trabalhar com dependência química." },
              { name: "Carlos R.", role: "Assistente Social", text: "Professor muito didático. Material complementar de altíssima qualidade. Recomendo fortemente." },
              { name: "Ana P.", role: "Enfermeira", text: "Recomendo para todos os profissionais da área. Vale cada centavo investido na formação." },
            ].map((dep, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic text-sm leading-relaxed">"{dep.text}"</p>
                  <div>
                    <p className="text-white font-semibold text-sm">{dep.name}</p>
                    <p className="text-slate-500 text-xs">{dep.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-slate-800/30">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Sobre a EducaDQ</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              O Centro de Formação e Estudos sobre Álcool e outras Drogas (EducaDQ) é referência
              em formação profissional na área de dependência química. Oferecemos cursos especializados
              em TREC, TRE, PPR, neurociência aplicada e prevenção a recaídas, com professores
              experientes e conteúdo baseado em evidências científicas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Flexibilidade", desc: "Estude no seu próprio ritmo, quando e onde quiser." },
                { title: "Qualidade", desc: "Conteúdo desenvolvido por especialistas reconhecidos." },
                { title: "Certificação", desc: "Receba certificados ao concluir os cursos." },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <h4 className="text-teal-400 font-semibold mb-2">{item.title}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Comece sua jornada de aprendizado
          </h3>
          <p className="text-slate-400 mb-8">
            Cadastre-se gratuitamente e explore nossos cursos especializados.
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8"
              onClick={() => setLocation("/login")}
            >
              Criar Conta Gratuita <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Profissionais em Destaque */}
      <ProfessionalsSection />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">EducaDQ</span>
              </div>
              <p className="text-slate-500 text-sm">
                Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Navegação</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#courses" className="hover:text-teal-400 transition-colors">Cursos</a></li>
                <li><Link href="/artigos" className="hover:text-teal-400 transition-colors">Artigos</Link></li>
                <li><a href="#about" className="hover:text-teal-400 transition-colors">Sobre</a></li>
                <li><Link href="/profissionais" className="hover:text-teal-400 transition-colors">Profissionais</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Redes Sociais</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="https://instagram.com/educadq" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Instagram @educadq</a></li>
                <li><a href="https://facebook.com/educadq" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Facebook @educadq</a></li>
                <li><a href="https://youtube.com/@educadq" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">YouTube @educadq</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contato</h4>
              <p className="text-slate-500 text-sm mb-2">
                WhatsApp:{" "}
                <a href="https://wa.me/5541988913431" className="hover:text-teal-400 transition-colors">
                  (41) 98891-3431
                </a>
              </p>
              <p className="text-slate-500 text-sm">
                PIX: 41 98891-3431
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-600 text-xs">
            <p>&copy; 2026 EducaDQ - Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
