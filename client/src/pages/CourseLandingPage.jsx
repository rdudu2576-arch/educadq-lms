import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Clock, BookOpen, Award, Play, CheckCircle, User, ArrowRight, Star, ShieldCheck, CreditCard, ArrowLeft } from "lucide-react";
function extractYouTubeId(url) {
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
}
export default function CourseLandingPage() {
    var _a;
    var params = useParams();
    var user = useAuth().user;
    var _b = trpc.courses.getBySlug.useQuery({ slug: params.slug || "" }, { enabled: !!params.slug }), course = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"/>
      </div>);
    }
    if (!course) {
        return (<div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4"/>
          <h2 className="text-xl font-semibold mb-2">Curso não encontrado</h2>
          <Link href="/">
            <Button variant="outline">Voltar à página inicial</Button>
          </Link>
        </div>
      </div>);
    }
    var handleGoBack = function () {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        }
        else {
            window.location.href = '/';
        }
    };
    var youtubeId = course.trailerUrl ? extractYouTubeId(course.trailerUrl) : null;
    var priceNum = parseFloat(course.price || "0");
    return (<>
    <SEO title={course.title} description={((_a = course.description) === null || _a === void 0 ? void 0 : _a.substring(0, 160)) || "Curso ".concat(course.title, " - EducaDQ")} ogImage={course.coverUrl || undefined} ogUrl={"https://educadq-ead.com.br/curso/".concat(course.slug)}/>
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 border-b border-teal-700/30">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Cursos", href: "/" },
            { label: course.title },
        ]}/>
          <button onClick={handleGoBack} className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4"/>
            Voltar
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"/>
        <div className="relative container max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 mb-4">
                Curso Online
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400"/>
                  <span>{course.courseHours}h de conteúdo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-400"/>
                  <span>Certificado incluso</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400"/>
                  <span>Acesso vitalício</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (<Link href={"/checkout/".concat(course.id)}>
                    <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white text-lg px-8 py-6">
                      <CreditCard className="w-5 h-5 mr-2"/>
                      Matricular-se por R$ {priceNum.toFixed(2).replace(".", ",")}
                    </Button>
                  </Link>) : (<a href={getLoginUrl()}>
                    <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white text-lg px-8 py-6">
                      <CreditCard className="w-5 h-5 mr-2"/>
                      Matricular-se por R$ {priceNum.toFixed(2).replace(".", ",")}
                    </Button>
                  </a>)}

              </div>
            </div>

            {/* Trailer / Cover */}
            <div className="relative">
              {youtubeId ? (<div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe src={"https://www.youtube.com/embed/".concat(youtubeId, "?rel=0")} title="Trailer do curso" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                </div>) : course.coverUrl ? (<div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={course.coverUrl} alt={course.title} className="w-full h-full object-cover"/>
                </div>) : (<div className="aspect-video rounded-xl bg-gradient-to-br from-teal-800 to-teal-600 flex items-center justify-center shadow-2xl">
                  <Play className="w-20 h-20 text-white/50"/>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* O que você vai aprender */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            O que você vai aprender
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
            "Fundamentos teóricos e práticos",
            "Técnicas baseadas em evidências científicas",
            "Estudos de caso reais e aplicáveis",
            "Metodologias de intervenção eficazes",
            "Abordagem multidisciplinar completa",
            "Material complementar exclusivo",
        ].map(function (item, i) { return (<div key={i} className="flex items-start gap-3 p-4">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0"/>
                <span className="text-foreground">{item}</span>
              </div>); })}
          </div>
        </div>
      </section>

      {/* Professor */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Seu Professor
          </h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-white"/>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">EducaDQ</h3>
                <p className="text-muted-foreground">
                  Centro de Formação e Estudos sobre Álcool e outras Drogas. Especialistas em dependência química,
                  codependência, prevenção a recaídas, TREC, TRE, PPR e neurociência aplicada.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            O que dizem nossos alunos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
            { name: "Maria S.", text: "Conteúdo excelente e muito bem estruturado. Mudou minha forma de trabalhar." },
            { name: "Carlos R.", text: "Professor muito didático. Material complementar de altíssima qualidade." },
            { name: "Ana P.", text: "Recomendo para todos os profissionais da área. Vale cada centavo investido." },
        ].map(function (dep, i) { return (<Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(function (s) { return (<Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400"/>); })}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{dep.text}"</p>
                  <p className="font-semibold text-sm">{dep.name}</p>
                </CardContent>
              </Card>); })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Comece sua jornada de aprendizado hoje
          </h2>
          <p className="text-teal-100 mb-8 text-lg">
            Invista no seu conhecimento e transforme sua carreira profissional.
          </p>
          <div className="flex flex-col items-center gap-4">
            {user ? (<Link href={"/checkout/".concat(course.id)}>
                <Button size="lg" className="bg-white text-teal-800 hover:bg-gray-100 text-lg px-8 py-6">
                  Matricular-se agora <ArrowRight className="w-5 h-5 ml-2"/>
                </Button>
              </Link>) : (<a href={getLoginUrl()}>
                <Button size="lg" className="bg-white text-teal-800 hover:bg-gray-100 text-lg px-8 py-6">
                  Matricular-se agora <ArrowRight className="w-5 h-5 ml-2"/>
                </Button>
              </a>)}
            <p className="text-sm text-teal-200">
              R$ {priceNum.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>
      </section>
    </div>
    </>);
}
