import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Briefcase, Search } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export default function ProfessionalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  const { data: professionals, isLoading } = trpc.ranking.getPublicRanking.useQuery({
    limit: 100,
    offset: 0,
  });

  const filtered = professionals?.filter((p: any) => {
    const matchesSearch = p.publicName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !cityFilter || p.city?.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesArea = !areaFilter || p.area?.toLowerCase().includes(areaFilter.toLowerCase());
    return matchesSearch && matchesCity && matchesArea;
  }) || [];

  return (
    <>
      <SEO
        title="Profissionais - EducaDQ"
        description="Encontre profissionais qualificados na área de álcool e outras drogas"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b">
          <div className="container max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">Banco de Profissionais</h1>
            <p className="text-lg text-muted-foreground">Encontre profissionais qualificados na área de álcool e outras drogas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filtrar por cidade..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <Input
              placeholder="Filtrar por área..."
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            />
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} profissional{filtered.length !== 1 ? "is" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((professional: any) => (
                  <Link key={professional.id} href={`/aluno/${professional.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{professional.publicName}</CardTitle>
                            <CardDescription className="mt-1">
                              {professional.level}
                            </CardDescription>
                          </div>
                          {professional.profileImageUrl && (
                            <img
                              src={professional.profileImageUrl}
                              alt={professional.publicName}
                              className="w-12 h-12 rounded-full object-cover ml-2"
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {professional.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {professional.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span>Profissional EducaDQ</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{professional.score} pontos</Badge>
                        </div>
                        <Button className="w-full mt-4">Ver Perfil</Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum profissional encontrado com esses critérios.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
