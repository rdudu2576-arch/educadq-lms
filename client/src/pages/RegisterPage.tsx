import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, Mail, Lock, AlertCircle, CheckCircle2, Phone, CreditCard, MapPin, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rg: "",
    cpf: "",
    phone: "",
    age: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "student",
        // Passando os campos adicionais no objeto (o backend precisará ser atualizado para aceitar)
        additionalData: {
          rg: formData.rg,
          cpf: formData.cpf,
          phone: formData.phone,
          age: formData.age,
          cep: formData.cep,
          address: formData.address,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        }
      } as any);

      if (result.userId) {
        setIsSuccess(true);
        setTimeout(() => {
          setLocation("/student");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md mx-4 text-center bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Conta criada!</h2>
          <p className="text-muted-foreground mb-6">
            Bem-vindo à EducaDQ. Redirecionando para seu painel...
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <SEO title="Criar minha conta grátis - EducaDQ" />
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Criar minha conta grátis</h1>
            <p className="text-sm text-muted-foreground">
              Preencha seus dados para acessar a plataforma e cursos gratuitos.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-400 border-b border-slate-700 pb-2">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">RG</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="rg" type="text" value={formData.rg} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">CPF</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="cpf" type="text" value={formData.cpf} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Idade</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-400 border-b border-slate-700 pb-2">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">CEP</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="cep" type="text" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} placeholder="00000-000" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Logradouro (Rua/Av)</label>
                  <input name="address" type="text" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Número</label>
                  <input name="number" type="text" value={formData.number} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Complemento</label>
                  <input name="complement" type="text" value={formData.complement} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bairro</label>
                  <input name="neighborhood" type="text" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Cidade</label>
                  <input name="city" type="text" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Estado (UF)</label>
                  <input name="state" type="text" value={formData.state} onChange={handleChange} maxLength={2} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase" required disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-400 border-b border-slate-700 pb-2">Dados de Acesso</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Senha (mín. 8 caracteres)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required minLength={8} disabled={isLoading} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-bold py-4 px-4 rounded-lg transition-all text-lg shadow-lg shadow-teal-900/20">
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Criando conta...</> : "Finalizar meu Cadastro Grátis"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">Já tem uma conta? <button onClick={() => setLocation("/login")} className="text-teal-400 hover:underline font-medium">Fazer login</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
