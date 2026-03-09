import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Users, Award, TrendingUp } from "lucide-react";
import SEO from "@/components/SEO";

export default function ProfissionaisEducadqPage() {
  return (
    <>
      <SEO
        title="Profissionais EducaDQ - Rede Especializada"
        description="Descubra a rede de profissionais qualificados na área de álcool e outras drogas"
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b">
          <div className="container max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold mb-6">Profissionais EducaDQ</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Uma rede especializada de profissionais qualificados na área de álcool e outras drogas
            </p>
            <Button size="lg" asChild>
              <a href="/profissionais">Explorar Profissionais</a>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-4xl mx-auto px-4 py-16 space-y-12">
          {/* O que é */}
          <section>
            <h2 className="text-3xl font-bold mb-6">O que é a Plataforma EducaDQ?</h2>
            <p className="text-lg text-muted-foreground mb-4">
              A EducaDQ é um centro de formação e estudos sobre álcool e outras drogas que oferece:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Educação Continuada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Cursos e treinamentos especializados para profissionais da área</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Comunidade Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Rede de profissionais qualificados e certificados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Certificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Certificados reconhecidos na área de saúde mental e dependência</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Desenvolvimento Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Oportunidades de crescimento e visibilidade na carreira</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Proposta Educacional */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Proposta Educacional</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p>
                  Nossa proposta é oferecer educação de qualidade para profissionais que trabalham na área de álcool e outras drogas, 
                  com foco em:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Formação continuada baseada em evidências científicas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Desenvolvimento de competências práticas e teóricas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Atualização sobre as melhores práticas de tratamento e prevenção</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Networking entre profissionais da área</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Banco de Profissionais */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Banco de Profissionais</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p>
                  O Banco de Profissionais EducaDQ é um diretório público de profissionais qualificados que:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Completaram cursos na plataforma EducaDQ</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Possuem certificações reconhecidas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Mantêm um perfil profissional atualizado</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Contribuem para a qualificação da área</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Importância da Qualificação */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Importância da Qualificação</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p>
                  A qualificação profissional na área de álcool e outras drogas é fundamental para:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Melhorar a qualidade do atendimento aos pacientes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Reduzir recaídas e melhorar resultados de tratamento</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Fortalecer a credibilidade profissional</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Contribuir para a saúde pública e prevenção</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Quero Fazer Parte!</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se à comunidade de profissionais qualificados da EducaDQ. Complete um curso, obtenha seu certificado e apareça no banco de profissionais.
            </p>
            <Button size="lg" asChild>
              <a href="https://forms.gle/8AKq9vzWLSYZQid28" target="_blank" rel="noopener noreferrer">
                Preencher Formulário
              </a>
            </Button>
          </section>

          {/* Contribuição */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Contribuição Anual</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Para aparecer publicamente no banco de profissionais da EducaDQ, é necessária uma contribuição anual de:
                </p>
                <div className="text-4xl font-bold text-primary mb-4">R$ 20,00/ano</div>
                <p className="text-muted-foreground">
                  Essa contribuição ajuda a manter a plataforma funcionando e garante a qualidade do banco de profissionais.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
