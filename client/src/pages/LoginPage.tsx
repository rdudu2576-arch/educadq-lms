import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, BookOpen, Mail, Lock, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // BYPASS INTERCEPTOR: Totalmente local, sem chamadas ao servidor
  const bypassEmails: { [key: string]: string } = {
    'admin@educadq.com': 'admin',
    'professor@educadq.com': 'professor',
    'aluno@educadq.com': 'aluno',
    'dev@educadq.com': 'desenvolvedor',
  };

  // Processar parâmetro 'role' da URL para preenchimento automático
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    
    if (roleParam) {
      const emailForRole = Object.keys(bypassEmails).find(key => bypassEmails[key] === roleParam);
      if (emailForRole) {
        setEmail(emailForRole);
        setPassword("bypass-auth-v2"); // Senha fictícia para habilitar o botão
      }
    }
  }, []);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "professor") {
        setLocation("/professor");
      } else if (user.role === "desenvolvedor") {
        setLocation("/admin/monitor");
      } else {
        setLocation("/student");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const emailLower = email.trim().toLowerCase();
    const bypassRole = bypassEmails[emailLower];
    
    if (bypassRole) {
      console.warn(`🔓 BYPASS ATIVO: ${email} -> ${bypassRole}`);
      // Salvar no localStorage para persistência
      localStorage.setItem('educadq-bypass-role', bypassRole);
      localStorage.setItem('educadq-bypass-email', emailLower);
      
      // Simular um pequeno delay de carregamento para UX
      setTimeout(() => {
        const targetPath = bypassRole === "admin" ? "/admin" : 
                           bypassRole === "professor" ? "/professor" :
                           bypassRole === "desenvolvedor" ? "/admin/monitor" : "/student";
        // Usar window.location.href para garantir que o AuthContext seja reinicializado com o novo role
        window.location.href = targetPath;
      }, 500);
      return;
    }

    // Se não for bypass, avisar que o servidor está offline
    setError("O servidor de autenticação real está offline. Use os e-mails de teste para acessar.");
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md mx-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">EducaDQ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plataforma de Educação a Distância
            </p>
          </div>

          {/* Descrição */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Acesse sua conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Entre com seu email e senha para acessar seus cursos.
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password-input" className="block text-sm font-medium text-foreground">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar na Plataforma"
              )}
            </button>
          </form>

          {/* Cadastro */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Ainda não tem uma conta?
            </p>
            <button
              className="w-full py-2 px-4 border border-primary text-primary hover:bg-primary/5 font-medium rounded-lg transition-colors"
            >
              Criar minha conta grátis
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mt-4">
              Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              EducaDQ © 2026 - Todos os direitos reservados
            </p>
          </div>

          {/* Dica de Teste */}
          <div className="mt-6 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
            <p className="text-xs text-cyan-400 font-mono">
              💡 Teste: admin@educadq.com | professor@educadq.com | aluno@educadq.com | dev@educadq.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
