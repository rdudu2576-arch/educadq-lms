import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";

export default function ArticlesPage() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery();

  return (
    <>
      <SEO title="Artigos e Pesquisas" description="Artigos científicos e pesquisas sobre dependência química, prevenção e tratamento." />
      <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-teal-800 to-teal-600 text-white py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Artigos e Pesquisas</h1>
          </div>
          <p className="text-lg text-teal-100 max-w-2xl">
            Conteúdo científico e acadêmico sobre dependência química, prevenção, tratamento e políticas públicas.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum artigo publicado ainda</h2>
            <p className="text-muted-foreground">Em breve teremos conteúdo disponível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/artigos/${article.slug}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full group">
                  {article.cover && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={article.cover}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(article.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
                      Ler artigo <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
    </>
  );
}
