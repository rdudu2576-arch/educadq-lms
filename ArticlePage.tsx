import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = trpc.articles.getBySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Artigo não encontrado</h2>
          <Link href="/artigos">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos artigos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <SEO
      title={article.title}
      description={article.excerpt || article.content.substring(0, 160)}
      ogImage={article.cover || undefined}
      ogUrl={`https://educadq-ead.com.br/artigos/${article.slug}`}
    />
    <div className="min-h-screen bg-background">
      {/* Hero */}
      {article.cover && (
        <div className="h-64 md:h-96 relative">
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{article.title}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/artigos">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos artigos
          </Button>
        </Link>

        {!article.cover && (
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{article.title}</h1>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-6 border-b">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(article.createdAt).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 prose prose-lg max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br/>") }} />
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
