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
import { useAuth } from "@/hooks/useAuth";
import { Loader2, BookOpen, Mail, Lock, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
export default function LoginPage() {
    var _this = this;
    var _a = useAuth(), user = _a.user, authLoading = _a.loading;
    var _b = useLocation(), setLocation = _b[1];
    var _c = useState(""), email = _c[0], setEmail = _c[1];
    var _d = useState(""), password = _d[0], setPassword = _d[1];
    var _e = useState(""), error = _e[0], setError = _e[1];
    var _f = useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var loginMutation = trpc.auth.login.useMutation();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError("");
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, loginMutation.mutateAsync({
                            email: email,
                            password: password,
                        })];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        // Login bem-sucedido, redirecionar baseado no role
                        if (result.user.role === "admin") {
                            setLocation("/admin");
                        }
                        else if (result.user.role === "professor") {
                            setLocation("/professor");
                        }
                        else {
                            setLocation("/student");
                        }
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || "Erro ao fazer login. Verifique suas credenciais.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Permitir que usuários logados acessem /login para fazer logout
    // Não redirecionar automaticamente
    if (authLoading) {
        return (<div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    return (<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md mx-4">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary"/>
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
          {error && (<div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-destructive">{error}</p>
            </div>)}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                <input type="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground" required disabled={isLoading}/>
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Senha
                </label>
                <button type="button" onClick={function () { return setLocation("/forgot-password"); }} className="text-xs text-primary hover:underline font-medium">
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                <input type="password" value={password} onChange={function (e) { return setPassword(e.target.value); }} placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground" required disabled={isLoading}/>
              </div>
            </div>

            {/* Botão de Login */}
            <button type="submit" disabled={isLoading || !email || !password} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors">
              {isLoading ? (<>
                  <Loader2 className="h-4 w-4 animate-spin"/>
                  Entrando...
                </>) : ("Entrar na Plataforma")}
            </button>
          </form>

          {/* Cadastro */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Ainda não tem uma conta?
            </p>
            <button onClick={function () { return setLocation("/register"); }} className="w-full py-2 px-4 border border-primary text-primary hover:bg-primary/5 font-medium rounded-lg transition-colors">
              Criar minha conta grátis
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              EducaDQ © 2026 - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>);
}
