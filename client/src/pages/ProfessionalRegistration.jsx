var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
export default function ProfessionalRegistration() {
    var _a = useAuth(), user = _a.user, loading = _a.loading;
    var _b = useLocation(), setLocation = _b[1];
    var _c = useState(false), submitted = _c[0], setSubmitted = _c[1];
    var _d = useState({
        email: (user === null || user === void 0 ? void 0 : user.email) || "",
        publicName: (user === null || user === void 0 ? void 0 : user.name) || "",
        phone: "",
        city: "",
        state: "",
        professionalBio: "",
        formation: "",
        linkedin: "",
        instagram: "",
        website: "",
        facebook: "",
        youtube: "",
        otherSocial: "",
        professionalPhone: "",
        professionalEmail: "",
        otherContacts: "",
        profileImageUrl: "",
    }), formData = _d[0], setFormData = _d[1];
    var updateProfile = trpc.professionals.updateProfile.useMutation({
        onSuccess: function () {
            setSubmitted(true);
            setTimeout(function () {
                setLocation("/profissionais");
            }, 3000);
        },
    });
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500"/>
      </div>);
    }
    if (!user) {
        return (<div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Você precisa estar logado para criar sua página profissional.
            </p>
            <Button onClick={function () { return setLocation("/"); }} className="w-full">
              Voltar à Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    if (submitted) {
        return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-500"/>
            </div>
            <CardTitle className="text-center">Cadastro Realizado!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Sua página profissional foi criada com sucesso. Você será redirecionado em breve.
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              <strong>Próximo passo:</strong> Realize o pagamento de R$ 20,00 via PIX para ativar sua página.
            </p>
            <div className="bg-slate-100 p-4 rounded-lg mb-4">
              <p className="text-xs font-semibold mb-2">PIX: 41988913431</p>
              <p className="text-xs text-muted-foreground">
                Envie o comprovante via WhatsApp: 41988913431
              </p>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    var handleSubmit = function (e) {
        e.preventDefault();
        updateProfile.mutate(formData);
    };
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    return (<>
      <SEO title="Criar Página Profissional | EducaDQ" description="Crie sua página profissional pública na plataforma EducaDQ e aumente sua visibilidade profissional."/>
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Página Profissional</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para criar sua página profissional pública na plataforma EducaDQ.
                Contribuição anual: R$ 20,00
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* IDENTIFICATION SECTION */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Identificação</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">E-mail *</label>
                      <Input type="email" name="email" value={formData.email} onChange={handleChange} required disabled className="bg-slate-100"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                      <Input type="text" name="publicName" value={formData.publicName} onChange={handleChange} required placeholder="Seu nome completo"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="(11) 99999-9999"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cidade *</label>
                        <Input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="São Paulo"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Estado *</label>
                      <Input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="SP" maxLength={2}/>
                    </div>
                  </div>
                </div>

                {/* PROFESSIONAL PRESENTATION */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Apresentação Profissional</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Breve apresentação profissional *
                      </label>
                      <Textarea name="professionalBio" value={formData.professionalBio} onChange={handleChange} required placeholder="Descreva sua trajetória, interesses e experiência profissional..." rows={5}/>
                    </div>
                  </div>
                </div>

                {/* FORMATION */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Formação e Cursos</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Descreva seus cursos realizados e respectivos anos de conclusão *
                      </label>
                      <Textarea name="formation" value={formData.formation} onChange={handleChange} required placeholder="Ex: Conselheiro Terapeuta em Dependência Química - EducaDQ (2024)..." rows={4}/>
                    </div>
                  </div>
                </div>

                {/* SOCIAL MEDIA */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Redes Sociais e Presença Online</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">LinkedIn</label>
                      <Input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/seu-perfil"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Instagram Profissional</label>
                      <Input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@seu_instagram"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Site ou Portfólio</label>
                      <Input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://seu-site.com"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Página Facebook</label>
                      <Input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/seu-perfil"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Canal YouTube</label>
                      <Input type="url" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/@seu-canal"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Outras redes sociais ou links profissionais</label>
                      <Textarea name="otherSocial" value={formData.otherSocial} onChange={handleChange} placeholder="Adicione outros links profissionais aqui..." rows={3}/>
                    </div>
                  </div>
                </div>

                {/* PROFESSIONAL CONTACTS */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contatos Profissionais</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Telefone Profissional</label>
                      <Input type="tel" name="professionalPhone" value={formData.professionalPhone} onChange={handleChange} placeholder="(11) 99999-9999"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Profissional</label>
                      <Input type="email" name="professionalEmail" value={formData.professionalEmail} onChange={handleChange} placeholder="seu@email.com"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Outras formas de contato</label>
                      <Textarea name="otherContacts" value={formData.otherContacts} onChange={handleChange} placeholder="Adicione outras formas de contato aqui..." rows={3}/>
                    </div>
                  </div>
                </div>

                {/* PHOTO */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Foto para Perfil</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        URL da Foto (clara, de boa qualidade e preferencialmente profissional) *
                      </label>
                      <Input type="url" name="profileImageUrl" value={formData.profileImageUrl} onChange={handleChange} required placeholder="https://..."/>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recomenda-se uma foto profissional, semelhante às utilizadas em currículos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PAYMENT INFO */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-2">Próximo Passo: Pagamento</p>
                      <p className="text-blue-800 mb-2">
                        Após preencher este formulário, você deverá realizar o pagamento de <strong>R$ 20,00</strong> via PIX.
                      </p>
                      <p className="text-blue-700 text-xs mb-2">
                        <strong>PIX:</strong> 41988913431
                      </p>
                      <p className="text-blue-700 text-xs">
                        <strong>Envie o comprovante via WhatsApp:</strong> 41988913431
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updateProfile.isPending} className="w-full bg-teal-600 hover:bg-teal-700">
                  {updateProfile.isPending ? (<>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                      Criando página...
                    </>) : ("Criar Página Profissional")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>);
}
