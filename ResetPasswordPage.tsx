import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

export function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get token from URL
  const token = new URLSearchParams(window.location.search).get("token");

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const result = await trpc.passwordReset.validateToken.query({ token });
        if (result.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch {
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const resetPassword = trpc.passwordReset.resetPassword.useMutation({
    onSuccess: () => {
      setResetSuccess(true);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setIsLoading(true);
    setError("");
    await resetPassword.mutateAsync({ token: token || "", password });
    setIsLoading(false);
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-center text-slate-400">Validando token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="space-y-2">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Token Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              O link de recuperação é inválido ou expirou. Por favor, solicite um novo link.
            </p>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              Solicitar Novo Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="space-y-2">
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Senha Resetada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">
              Sua senha foi resetada com sucesso. Você será redirecionado para o login...
            </p>
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
            <Lock className="w-5 h-5" />
            Resetar Senha
          </CardTitle>
          <CardDescription>Insira sua nova senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Nova Senha</label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Confirmar Senha</label>
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700">
              {isLoading ? "Resetando..." : "Resetar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
