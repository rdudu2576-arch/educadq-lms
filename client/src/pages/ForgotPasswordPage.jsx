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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import SEO from "@/components/SEO";
export default function ForgotPasswordPage() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var _b = useState(""), email = _b[0], setEmail = _b[1];
    var _c = useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = useState(false), isSuccess = _d[0], setIsSuccess = _d[1];
    var _e = useState(""), error = _e[0], setError = _e[1];
    var forgotPasswordMutation = trpc.auth.forgotPassword.useMutation();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!email) {
                        setError("Por favor, insira seu email");
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError("");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, forgotPasswordMutation.mutateAsync({ email: email })];
                case 2:
                    _a.sent();
                    setIsSuccess(true);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1.message || "Erro ao processar solicitação. Verifique o e-mail informado.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SEO title="Recuperar Senha - EducaDQ"/>
      <div className="w-full max-w-md mx-4">
        <Card className="bg-card rounded-2xl shadow-2xl p-4 border border-border">
          <CardHeader className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary"/>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Recuperar Senha</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2 text-center">
              Informe seu e-mail para receber as instruções de redefinição de senha.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (<div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-500"/>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">E-mail enviado!</h2>
                  <p className="text-sm text-muted-foreground">
                    Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha em instantes.
                  </p>
                </div>
                <Button onClick={function () { return setLocation("/login"); }} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors">
                  Voltar para o Login
                </Button>
              </div>) : (<>
                {error && (<div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"/>
                    <p className="text-sm text-destructive">{error}</p>
                  </div>)}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                      <Input type="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" required disabled={isLoading}/>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading || !email} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors">
                    {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin"/> Enviando...</>) : ("Enviar instruções")}
                  </Button>

                  <Button type="button" variant="ghost" onClick={function () { return setLocation("/login"); }} className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
                    <ArrowLeft className="h-4 w-4"/>
                    Voltar para o Login
                  </Button>
                </form>
              </>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
