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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { Loader2, User, Mail, Lock, AlertCircle, CheckCircle2, Phone, CreditCard, MapPin, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
export default function RegisterPage() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState({
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
    }), formData = _b[0], setFormData = _b[1];
    var _c = useState(""), error = _c[0], setError = _c[1];
    var _d = useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(false), isSuccess = _e[0], setIsSuccess = _e[1];
    var registerMutation = trpc.auth.register.useMutation();
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleCepBlur = function () { return __awaiter(_this, void 0, void 0, function () {
        var cep, response, data_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cep = formData.cep.replace(/\D/g, "");
                    if (!(cep.length === 8)) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("https://viacep.com.br/ws/".concat(cep, "/json/"))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data_1 = _a.sent();
                    if (!data_1.erro) {
                        setFormData(function (prev) { return (__assign(__assign({}, prev), { address: data_1.logradouro, neighborhood: data_1.bairro, city: data_1.localidade, state: data_1.uf })); });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Erro ao buscar CEP:", err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    if (formData.password !== formData.confirmPassword) {
                        setError("As senhas não coincidem.");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, registerMutation.mutateAsync({
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
                        })];
                case 2:
                    result = _a.sent();
                    if (result.userId) {
                        setIsSuccess(true);
                        setTimeout(function () {
                            setLocation("/student");
                        }, 2000);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError(err_2.message || "Erro ao criar conta. Tente novamente.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (isSuccess) {
        return (<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md mx-4 text-center bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500"/>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Conta criada!</h2>
          <p className="text-muted-foreground mb-6">
            Bem-vindo à EducaDQ. Redirecionando para seu painel...
          </p>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto"/>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <SEO title="Criar minha conta grátis - EducaDQ"/>
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Criar minha conta grátis</h1>
            <p className="text-sm text-muted-foreground">
              Preencha seus dados para acessar a plataforma e cursos gratuitos.
            </p>
          </div>

          {error && (<div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-destructive">{error}</p>
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-400 border-b border-slate-700 pb-2">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">RG</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="rg" type="text" value={formData.rg} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">CPF</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="cpf" type="text" value={formData.cpf} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Idade</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
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
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="cep" type="text" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} placeholder="00000-000" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Logradouro (Rua/Av)</label>
                  <input name="address" type="text" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Número</label>
                  <input name="number" type="text" value={formData.number} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Complemento</label>
                  <input name="complement" type="text" value={formData.complement} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" disabled={isLoading}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bairro</label>
                  <input name="neighborhood" type="text" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Cidade</label>
                  <input name="city" type="text" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Estado (UF)</label>
                  <input name="state" type="text" value={formData.state} onChange={handleChange} maxLength={2} className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase" required disabled={isLoading}/>
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
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Senha (mín. 8 caracteres)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                      <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required minLength={8} disabled={isLoading}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                      <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary outline-none" required disabled={isLoading}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-bold py-4 px-4 rounded-lg transition-all text-lg shadow-lg shadow-teal-900/20">
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin"/> Criando conta...</> : "Finalizar meu Cadastro Grátis"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">Já tem uma conta? <button onClick={function () { return setLocation("/login"); }} className="text-teal-400 hover:underline font-medium">Fazer login</button></p>
          </div>
        </div>
      </div>
    </div>);
}
