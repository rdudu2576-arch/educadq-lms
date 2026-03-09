import SEO from "@/components/SEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, BookOpen, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setLocation("/student");
    },
  });

  const validatePassword = (password: string) => {
    if (password.length < 8) return "weak";
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) return "strong";
    if (/^(?=.*[a-z])(?=.*[A-Z])/.test(password) || /^(?=.*\d)/.test(password)) return "medium";
    return "weak";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(validatePassword(value));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <>
      <SEO
        title="Criar Conta"
        description="Crie sua conta na plataforma EducaDQ e comece a aprender com cursos de alta qualidade em dependência química, prevenção a recaídas e neurociência."
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <div className="space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6h-6m0 0H6" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl text-center text-white font-bold">Criar Conta</h1>
            <p className="text-center text-slate-400 text-sm">
              Cadastre-se para acessar os cursos da EducaDQ
            </p>
          </div>

        <div className="space-y-4">
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">
                Nome Completo
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                disabled={registerMutation.isPending}
                className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={registerMutation.isPending}
                className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  disabled={registerMutation.isPending}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Força da Senha */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <div
                      className={`h-1 flex-1 rounded ${
                        passwordStrength ? "bg-red-500" : "bg-slate-600"
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${
                        passwordStrength === "strong" || passwordStrength === "medium"
                          ? "bg-yellow-500"
                          : "bg-slate-600"
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${
                        passwordStrength === "strong" ? "bg-green-500" : "bg-slate-600"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Força:{" "}
                    <span
                      className={
                        passwordStrength === "weak"
                          ? "text-red-400"
                          : passwordStrength === "medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                      }
                    >
                      {passwordStrength === "weak"
                        ? "Fraca"
                        : passwordStrength === "medium"
                          ? "Média"
                          : "Forte"}
                    </span>
                  </p>
                </div>
              )}

              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  disabled={registerMutation.isPending}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Senhas coincidem
                </div>
              )}

              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2"
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="text-center text-sm text-slate-400">
            Já tem conta?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Faça login
            </button>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
}
