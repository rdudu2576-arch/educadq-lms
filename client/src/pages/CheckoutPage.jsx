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
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Copy, QrCode, CreditCard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function CheckoutPage(_a) {
    var _this = this;
    var params = _a.params;
    var _b = useAuth({ redirectOnUnauthenticated: true }), user = _b.user, authLoading = _b.loading;
    var _c = useLocation(), setLocation = _c[1];
    var courseId = (params === null || params === void 0 ? void 0 : params.courseId) ? parseInt(params.courseId) : null;
    var _d = useState(1), installments = _d[0], setInstallments = _d[1];
    var pixKey = useState("41988913431")[0];
    var _e = useState(false), copied = _e[0], setCopied = _e[1];
    var _f = useState(false), isProcessing = _f[0], setIsProcessing = _f[1];
    var _g = useState("pix"), paymentMethod = _g[0], setPaymentMethod = _g[1];
    // Fetch course details
    var _h = trpc.courses.getById.useQuery({ courseId: courseId || 0 }, { enabled: !!courseId }), course = _h.data, courseLoading = _h.isLoading;
    // Create payment mutation
    var createPaymentMutation = trpc.payments.create.useMutation({
        onSuccess: function () {
            setIsProcessing(false);
            setLocation("/pagamento-confirmado");
        },
        onError: function (error) {
            setIsProcessing(false);
            console.error("Erro ao criar pagamento:", error);
        },
    });
    // Note: Stripe and MercadoPago integrations are available via API endpoints
    // Enroll student mutation
    var enrollMutation = trpc.courses.enroll.useMutation({
        onSuccess: function () {
            // After enrollment, redirect to course
            setLocation("/student");
        },
        onError: function (error) {
            console.error("Erro ao matricular:", error);
        },
    });
    if (authLoading || courseLoading) {
        return (<div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    if (!user) {
        return null;
    }
    if (!course) {
        return (<div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Curso não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O curso que você está tentando acessar não foi encontrado.
            </p>
            <Button onClick={function () { return setLocation("/"); }} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    var coursePrice = parseFloat(course.price);
    var installmentPrice = coursePrice / installments;
    var totalPrice = coursePrice;
    var handlePayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, createPaymentMutation.mutateAsync({
                            courseId: course.id,
                            amount: course.price,
                            installments: installments,
                            pixKey: pixKey,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, enrollMutation.mutateAsync({
                            courseId: course.id,
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error("Erro no checkout:", error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var copyToClipboard = function () {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000);
    };
    return (<>
      <SEO title={"Checkout - ".concat(course.title)} description={"Complete seu pagamento para acessar o curso ".concat(course.title, " na plataforma EducaDQ.")}/>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Summary */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                  <CardDescription>Revise os detalhes antes de confirmar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Info */}
                  <div className="flex gap-4 pb-6 border-b border-border">
                    {course.coverUrl && (<img src={course.coverUrl} alt={course.title} className="w-24 h-24 rounded-lg object-cover"/>)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary">Acesso Vitalício</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preço do Curso</span>
                      <span className="text-foreground font-medium">
                        R$ {coursePrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="text-green-500 font-medium">R$ 0,00</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-primary">
                        R$ {totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Installments */}
                  <div className="space-y-3 pt-6 border-t border-border">
                    <label className="block text-sm font-medium text-foreground">
                      Número de Parcelas
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(function (num) { return (<button key={num} onClick={function () { return setInstallments(num); }} className={"py-2 px-3 rounded-lg border transition-colors ".concat(installments === num
                ? "bg-primary text-white border-primary"
                : "bg-background border-border text-foreground hover:border-primary")}>
                          {num}x
                        </button>); })}
                    </div>
                    {installments > 1 && (<p className="text-xs text-muted-foreground">
                        {installments}x de R$ {installmentPrice.toFixed(2)}
                      </p>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Método de Pagamento</CardTitle>
                  <CardDescription>Escolha sua forma preferida</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Tabs */}
                  <Tabs value={paymentMethod} onValueChange={function (v) { return setPaymentMethod(v); }} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="pix">PIX</TabsTrigger>
                      <TabsTrigger value="stripe">Cartão</TabsTrigger>
                      <TabsTrigger value="mercadopago">MP</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {/* PIX Key Display */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      Chave PIX
                    </label>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border">
                      <code className="flex-1 text-sm font-mono text-muted-foreground break-all">
                        {pixKey}
                      </code>
                      <button onClick={copyToClipboard} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Copiar chave PIX">
                        {copied ? (<CheckCircle className="w-4 h-4 text-green-500"/>) : (<Copy className="w-4 h-4 text-muted-foreground"/>)}
                      </button>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                      QR Code
                    </label>
                    <div className="bg-background p-4 rounded-lg border border-border flex items-center justify-center h-40">
                      <div className="text-center">
                        <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-2"/>
                        <p className="text-xs text-muted-foreground">
                          QR Code será gerado após confirmação
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"/>
                      <div className="text-xs text-blue-100">
                        <p className="font-semibold mb-1">Como pagar:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Copie a chave PIX acima</li>
                          <li>Abra seu app bancário</li>
                          <li>Selecione PIX → Transferência</li>
                          <li>Cole a chave e confirme</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-colors">
                    {isProcessing ? (<>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                        Processando...
                      </>) : paymentMethod === "stripe" ? (<>
                        <CreditCard className="w-4 h-4 mr-2"/>
                        Pagar com Stripe - R$ {totalPrice.toFixed(2)}
                      </>) : paymentMethod === "mercadopago" ? (<>
                        <CreditCard className="w-4 h-4 mr-2"/>
                        Pagar com MercadoPago - R$ {totalPrice.toFixed(2)}
                      </>) : ("Confirmar Pagamento PIX - R$ ".concat(totalPrice.toFixed(2)))}
                  </Button>

                  {/* Payment Info */}
                  {paymentMethod === "stripe" && (<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-100">
                        ✓ Cartão de crédito/débito - Parcelamento disponível
                      </p>
                    </div>)}
                  {paymentMethod === "mercadopago" && (<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-100">
                        ✓ Múltiplas opções: Cartão, PIX, Boleto, Transferência
                      </p>
                    </div>)}

                  {/* Security Badge */}
                  <div className="text-center text-xs text-muted-foreground">
                    <p>✓ Pagamento seguro e criptografado</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>);
}
