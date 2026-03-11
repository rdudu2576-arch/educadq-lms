import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Mail, ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const requestReset = trpc.passwordReset.requestReset.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, insira seu email");
      return;
    }

    setIsLoading(true);
    setError("");
    await requestReset.mutateAsync({ email });
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="space-y-2">
            <CardTitle className="text-white">Email enviado</CardTitle>
            <CardDescription>Verifique seu email para o link de recuperação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Se o email existir em nossa base de dados, você receberá um link para resetar sua senha.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Recuperar Senha
          </CardTitle>
          <CardDescription>Insira seu email para receber um link de recuperação</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700">
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full text-cyan-400 hover:text-cyan-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
