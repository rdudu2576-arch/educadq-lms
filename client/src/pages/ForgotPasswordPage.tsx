import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import SEO from "@/components/SEO";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, insira seu email");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao processar solicitação. Verifique o e-mail informado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SEO title="Recuperar Senha - EducaDQ" />
      <div className="w-full max-w-md mx-4">
        <Card className="bg-card rounded-2xl shadow-2xl p-4 border border-border">
          <CardHeader className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Recuperar Senha</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2 text-center">
              Informe seu e-mail para receber as instruções de redefinição de senha.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">E-mail enviado!</h2>
                  <p className="text-sm text-muted-foreground">
                    Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha em instantes.
                  </p>
                </div>
                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Voltar para o Login
                </Button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                    ) : (
                      "Enviar instruções"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLocation("/login")}
                    className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o Login
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
