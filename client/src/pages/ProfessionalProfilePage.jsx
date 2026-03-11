import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
export default function ProfessionalProfilePage() {
    var _a = useRoute("/aluno/:slug"), match = _a[0], params = _a[1];
    var slug = params === null || params === void 0 ? void 0 : params.slug;
    var _b = trpc.ranking.getPublicRanking.useQuery({ limit: 1, offset: 0 }, { enabled: !!slug }), profile = _b.data, isLoading = _b.isLoading;
    // Filter profile by slug
    var filteredProfile = profile === null || profile === void 0 ? void 0 : profile.find(function (p) { return p.slug === slug; });
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    if (!filteredProfile) {
        return (<div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardTitle>Perfil não encontrado</CardTitle>
          <CardDescription>O perfil profissional que você está procurando não existe.</CardDescription>
        </Card>
      </div>);
    }
    var p = filteredProfile;
    return (<>
      <SEO title={"".concat(p.publicName, " - Profissional EducaDQ")} description={p.bio || "Perfil profissional de ".concat(p.publicName, " na plataforma EducaDQ")} ogImage={p.profileImageUrl || undefined}/>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b">
          <div className="container max-w-4xl mx-auto px-4 py-12">
            <div className="flex gap-6 items-start">
              {p.profileImageUrl && (<img src={p.profileImageUrl} alt={p.publicName} className="w-32 h-32 rounded-full object-cover border-4 border-primary"/>)}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{p.publicName}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4"/>
                    <span>Profissional EducaDQ</span>
                  </div>
                </div>
                {p.bio && <p className="text-lg text-muted-foreground">{p.bio}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Informações */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Profissionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Perfil profissional na plataforma EducaDQ</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Membro da comunidade EducaDQ</p>
                </CardContent>
              </Card>

              {/* Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle>Posição no Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">#{p.id}</div>
                    <p className="text-muted-foreground">{p.score} pontos</p>
                    <Badge className="mt-2">{p.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>);
}
