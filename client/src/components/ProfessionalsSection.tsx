import { useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfessionalsSection() {
  const [, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: professionals, isLoading } = trpc.professionals.list.useQuery({
    limit: 10,
    offset: 0,
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        </div>
      </section>
    );
  }

  if (!professionals || professionals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Profissionais em Destaque
            </h2>
            <p className="text-slate-400">
              Conheça os profissionais especializados da comunidade EducaDQ
            </p>
          </div>
          <Button
            onClick={() => setLocation("/profissionais")}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
          >
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Carousel */}
        <div className="relative group">
          {/* Botão Esquerda */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-slate-900/90 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="flex-shrink-0 w-[280px] group/card cursor-pointer"
                onClick={() => setLocation(`/profissional/${professional.id}`)}
              >
                <Card className="h-full bg-slate-800 border-slate-700 hover:border-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/20">
                  <CardContent className="p-0">
                    {/* Foto */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800">
                      {professional.profileImageUrl ? (
                        <img
                          src={professional.profileImageUrl}
                          alt={professional.publicName || "Profissional"}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-bold text-white/30">
                            {professional.publicName?.charAt(0).toUpperCase() || "P"}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-sm font-medium">Ver perfil</span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="p-4">
                      {/* Nome e Nível */}
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                        {professional.publicName}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-teal-600/30 text-teal-300 rounded text-xs font-semibold">
                          {professional.level || "Profissional"}
                        </span>
                        {professional.score && professional.score > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {professional.score}
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                        {professional.bio || professional.professionalBio || "Profissional especializado"}
                      </p>

                      {/* Localização */}
                      {professional.city && (
                        <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {professional.city}, {professional.state}
                          </span>
                        </div>
                      )}

                      {/* CTA */}
                      <Button
                        size="sm"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/profissional/${professional.id}`);
                        }}
                      >
                        Ver Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Botão Direita */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-slate-900/90 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* CTA Final */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">
            Quer aparecer aqui? Crie sua página profissional e aumente sua visibilidade!
          </p>
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => setLocation("/profissional/cadastro")}
          >
            Criar Página Profissional
          </Button>
        </div>
      </div>
    </section>
  );
}
