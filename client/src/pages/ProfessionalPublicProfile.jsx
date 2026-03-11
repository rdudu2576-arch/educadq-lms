import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Mail, Phone, MapPin, Globe, Linkedin, Instagram, Facebook, Youtube, MessageCircle, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { useLocation } from "wouter";
export default function ProfessionalPublicProfile() {
    var _a;
    var id = useParams().id;
    var _b = useLocation(), setLocation = _b[1];
    var _c = trpc.professionals.getById.useQuery({ id: parseInt(id || "0") }, { enabled: !!id }), professional = _c.data, isLoading = _c.isLoading, error = _c.error;
    if (isLoading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500"/>
      </div>);
    }
    if (error || !professional) {
        return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-red-600">Profissional não encontrado</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Desculpe, não conseguimos encontrar o perfil deste profissional.
            </p>
            <Button onClick={function () { return setLocation("/profissionais"); }} className="w-full">
              Voltar para Profissionais
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    var handleWhatsAppContact = function () {
        var _a;
        var phone = ((_a = professional.phone) === null || _a === void 0 ? void 0 : _a.replace(/\D/g, "")) || "";
        var message = encodeURIComponent("Ol\u00E1 ".concat(professional.publicName || "Profissional", ", gostaria de conversar com voc\u00EA!"));
        window.open("https://wa.me/".concat(phone, "?text=").concat(message), "_blank");
    };
    var handleEmailContact = function () {
        var email = professional.professionalEmail || professional.email;
        var subject = encodeURIComponent("Contato via EducaDQ");
        var body = encodeURIComponent("Ol\u00E1 ".concat(professional.publicName, ",\n\nGostaria de conversar com voc\u00EA sobre seus servi\u00E7os.\n\nAtenciosamente"));
        window.location.href = "mailto:".concat(email, "?subject=").concat(subject, "&body=").concat(body);
    };
    return (<>
      <SEO title={"".concat(professional.publicName, " | EducaDQ")} description={professional.professionalBio || "Perfil profissional na plataforma EducaDQ"}/>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header com botão voltar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <Button variant="ghost" onClick={function () { return setLocation("/profissionais"); }} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4"/>
              Voltar para Profissionais
            </Button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coluna Esquerda - Foto e Informações de Contato */}
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  {/* Foto */}
                  <div className="mb-6">
                    {professional.profileImageUrl ? (<img src={professional.profileImageUrl} alt={professional.publicName || "Profissional"} className="w-full h-64 object-cover rounded-lg mb-4"/>) : (<div className="w-full h-64 bg-gradient-to-br from-teal-200 to-teal-400 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {(_a = professional.publicName) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()}
                        </span>
                      </div>)}

                    {/* Nome e Nível */}
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{professional.publicName}</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                        {professional.level || "Profissional"}
                      </span>
                      {professional.score && (<span className="text-sm text-amber-600 font-semibold">
                          ⭐ {professional.score} pontos
                        </span>)}
                    </div>

                    {/* Localização */}
                    {(professional.city || professional.state) && (<div className="flex items-center gap-2 text-slate-600 mb-4">
                        <MapPin className="w-4 h-4"/>
                        <span className="text-sm">
                          {professional.city}, {professional.state}
                        </span>
                      </div>)}

                    {/* Botões de Contato */}
                    <div className="space-y-3 border-t border-slate-200 pt-6">
                      {professional.phone && (<Button onClick={handleWhatsAppContact} className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4"/>
                          WhatsApp
                        </Button>)}

                      {(professional.professionalEmail || professional.email) && (<Button onClick={handleEmailContact} variant="outline" className="w-full flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4"/>
                          Email
                        </Button>)}

                      {professional.professionalPhone && professional.professionalPhone !== professional.phone && (<Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={function () { return window.location.href = "tel:".concat(professional.professionalPhone); }}>
                          <Phone className="w-4 h-4"/>
                          Ligar
                        </Button>)}
                    </div>

                    {/* Redes Sociais */}
                    {(professional.linkedin || professional.instagram || professional.website || professional.facebook || professional.youtube) && (<div className="border-t border-slate-200 pt-6 mt-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Redes Sociais</h3>
                        <div className="flex flex-wrap gap-3">
                          {professional.linkedin && (<a href={professional.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-blue-100 rounded-lg transition" title="LinkedIn">
                              <Linkedin className="w-5 h-5 text-blue-600"/>
                            </a>)}
                          {professional.instagram && (<a href={"https://instagram.com/".concat(professional.instagram.replace("@", ""))} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-pink-100 rounded-lg transition" title="Instagram">
                              <Instagram className="w-5 h-5 text-pink-600"/>
                            </a>)}
                          {professional.facebook && (<a href={professional.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-blue-100 rounded-lg transition" title="Facebook">
                              <Facebook className="w-5 h-5 text-blue-700"/>
                            </a>)}
                          {professional.youtube && (<a href={professional.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-red-100 rounded-lg transition" title="YouTube">
                              <Youtube className="w-5 h-5 text-red-600"/>
                            </a>)}
                          {professional.website && (<a href={professional.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 hover:bg-teal-100 rounded-lg transition" title="Website">
                              <Globe className="w-5 h-5 text-teal-600"/>
                            </a>)}
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Informações Detalhadas */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio Profissional */}
              {professional.professionalBio && (<Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-slate-900">Sobre</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {professional.professionalBio}
                    </p>
                  </CardContent>
                </Card>)}

              {/* Formação e Cursos */}
              {professional.formation && (<Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-slate-900">Formação e Cursos</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {professional.formation.split("\n").map(function (line, idx) { return (<div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-2"/>
                          <p className="text-slate-700">{line.trim()}</p>
                        </div>); })}
                    </div>
                  </CardContent>
                </Card>)}

              {/* Outras Formas de Contato */}
              {professional.otherContacts && (<Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-slate-900">Outras Formas de Contato</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {professional.otherContacts}
                    </p>
                  </CardContent>
                </Card>)}

              {/* Outras Redes Sociais */}
              {professional.otherSocial && (<Card>
                  <CardHeader>
                    <h2 className="text-xl font-bold text-slate-900">Outras Redes Sociais</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {professional.otherSocial}
                    </p>
                  </CardContent>
                </Card>)}

              {/* CTA Final */}
              <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Deseja entrar em contato?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {professional.phone && (<Button onClick={handleWhatsAppContact} className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4"/>
                        Enviar WhatsApp
                      </Button>)}
                    {(professional.professionalEmail || professional.email) && (<Button onClick={handleEmailContact} className="bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4"/>
                        Enviar Email
                      </Button>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>);
}
