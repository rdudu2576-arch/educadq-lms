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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, QrCode, CreditCard, Banknote, Landmark, Building2 } from "lucide-react";
export default function MercadoPagoCheckoutPage(_a) {
    var _this = this;
    var params = _a.params;
    var _b = useAuth({ redirectOnUnauthenticated: true }), user = _b.user, authLoading = _b.loading;
    var _c = useLocation(), setLocation = _c[1];
    var courseId = (params === null || params === void 0 ? void 0 : params.courseId) ? parseInt(params.courseId) : null;
    var _d = useState(false), copied = _d[0], setCopied = _d[1];
    var _e = useState(false), isProcessing = _e[0], setIsProcessing = _e[1];
    var _f = useState("checkout"), paymentMethod = _f[0], setPaymentMethod = _f[1];
    var _g = useState(1), installments = _g[0], setInstallments = _g[1];
    // Fetch course details
    var _h = trpc.courses.getById.useQuery({ courseId: courseId || 0 }, { enabled: !!courseId }), course = _h.data, courseLoading = _h.isLoading;
    // Mutations
    var checkoutMutation = trpc.mercadopago.createCheckout.useMutation({
        onSuccess: function (data) {
            window.open(data.checkoutUrl, "_blank");
            setIsProcessing(false);
        },
        onError: function (error) {
            console.error("Erro:", error);
            setIsProcessing(false);
        },
    });
    var cardPaymentMutation = trpc.mercadopago.createCardPayment.useMutation({
        onSuccess: function () {
            setIsProcessing(false);
            setLocation("/pagamento-confirmado");
        },
        onError: function (error) {
            console.error("Erro:", error);
            setIsProcessing(false);
        },
    });
    var pixPaymentMutation = trpc.mercadopago.createPixPayment.useMutation({
        onSuccess: function () {
            setIsProcessing(false);
            setLocation("/pagamento-pix");
        },
        onError: function (error) {
            console.error("Erro:", error);
            setIsProcessing(false);
        },
    });
    var boletoPaymentMutation = trpc.mercadopago.createBoletoPayment.useMutation({
        onSuccess: function () {
            setIsProcessing(false);
            setLocation("/pagamento-boleto");
        },
        onError: function (error) {
            console.error("Erro:", error);
            setIsProcessing(false);
        },
    });
    var transferPaymentMutation = trpc.mercadopago.createTransferPayment.useMutation({
        onSuccess: function () {
            setIsProcessing(false);
            setLocation("/pagamento-transferencia");
        },
        onError: function (error) {
            console.error("Erro:", error);
            setIsProcessing(false);
        },
    });
    if (authLoading || courseLoading) {
        return (<div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary"/>
      </div>);
    }
    if (!course) {
        return (<div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Curso não encontrado</p>
          </CardContent>
        </Card>
      </div>);
    }
    var coursePrice = parseFloat(course.price);
    var installmentPrice = coursePrice / installments;
    var handlePayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user || !course)
                        return [2 /*return*/];
                    setIsProcessing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    if (!(paymentMethod === "checkout")) return [3 /*break*/, 3];
                    return [4 /*yield*/, checkoutMutation.mutateAsync({
                            courseId: course.id,
                            courseName: course.title,
                            coursePrice: coursePrice,
                            installments: installments,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 3:
                    if (!(paymentMethod === "card")) return [3 /*break*/, 5];
                    return [4 /*yield*/, cardPaymentMutation.mutateAsync({
                            courseId: course.id,
                            courseName: course.title,
                            coursePrice: coursePrice,
                            cardToken: "token_placeholder",
                            installments: installments,
                        })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 5:
                    if (!(paymentMethod === "pix")) return [3 /*break*/, 7];
                    return [4 /*yield*/, pixPaymentMutation.mutateAsync({
                            courseId: course.id,
                            courseName: course.title,
                            coursePrice: coursePrice,
                        })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 7:
                    if (!(paymentMethod === "boleto")) return [3 /*break*/, 9];
                    return [4 /*yield*/, boletoPaymentMutation.mutateAsync({
                            courseId: course.id,
                            courseName: course.title,
                            coursePrice: coursePrice,
                        })];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 9:
                    if (!(paymentMethod === "transfer")) return [3 /*break*/, 11];
                    return [4 /*yield*/, transferPaymentMutation.mutateAsync({
                            courseId: course.id,
                            courseName: course.title,
                            coursePrice: coursePrice,
                        })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    console.error("Erro no pagamento:", error_1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <SEO title={"Checkout - ".concat(course.title)} description={"Finalize seu pagamento para acessar o curso ".concat(course.title)}/>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Summary */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Resumo do Pedido</CardTitle>
                  <CardDescription>Revise os detalhes antes de pagar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Info */}
                  <div className="flex gap-4 pb-6 border-b border-border">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline">Acesso vitalício</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preço do curso</span>
                      <span className="font-semibold">R$ {coursePrice.toFixed(2)}</span>
                    </div>
                    {paymentMethod === "card" && installments > 1 && (<div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parcelamento ({installments}x)</span>
                        <span className="font-semibold">R$ {installmentPrice.toFixed(2)} cada</span>
                      </div>)}
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">R$ {coursePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4 pt-6">
                    <h4 className="font-semibold text-foreground">Escolha seu método de pagamento</h4>

                    <Tabs value={paymentMethod} onValueChange={function (v) { return setPaymentMethod(v); }} className="w-full">
                      <TabsList className="grid w-full grid-cols-5 gap-1">
                        <TabsTrigger value="checkout" className="text-xs">
                          <Banknote className="w-4 h-4 mr-1"/>
                          Todos
                        </TabsTrigger>
                        <TabsTrigger value="card" className="text-xs">
                          <CreditCard className="w-4 h-4 mr-1"/>
                          Cartão
                        </TabsTrigger>
                        <TabsTrigger value="pix" className="text-xs">
                          <QrCode className="w-4 h-4 mr-1"/>
                          PIX
                        </TabsTrigger>
                        <TabsTrigger value="boleto" className="text-xs">
                          <Landmark className="w-4 h-4 mr-1"/>
                          Boleto
                        </TabsTrigger>
                        <TabsTrigger value="transfer" className="text-xs">
                          <Building2 className="w-4 h-4 mr-1"/>
                          Transfer
                        </TabsTrigger>
                      </TabsList>

                      {/* Checkout Tab */}
                      <TabsContent value="checkout" className="space-y-4 mt-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <p className="text-sm text-blue-100">
                            ✓ Acesse todas as opções de pagamento do MercadoPago
                          </p>
                          <p className="text-xs text-blue-100/80 mt-2">
                            Cartão de crédito/débito, PIX, Boleto, Transferência e Wallet
                          </p>
                        </div>
                      </TabsContent>

                      {/* Card Tab */}
                      <TabsContent value="card" className="space-y-4 mt-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                          <p className="text-sm text-green-100">
                            ✓ Cartão de crédito/débito com parcelamento
                          </p>
                        </div>

                        {/* Installments */}
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">
                            Parcelar em quantas vezes?
                          </label>
                          <select value={installments} onChange={function (e) { return setInstallments(parseInt(e.target.value)); }} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground">
                            {[1, 2, 3, 4, 6, 12].map(function (num) { return (<option key={num} value={num}>
                                {num}x de R$ {(coursePrice / num).toFixed(2)}
                              </option>); })}
                          </select>
                        </div>
                      </TabsContent>

                      {/* PIX Tab */}
                      <TabsContent value="pix" className="space-y-4 mt-4">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                          <p className="text-sm text-purple-100">
                            ✓ PIX instantâneo - Receba confirmação em segundos
                          </p>
                        </div>
                      </TabsContent>

                      {/* Boleto Tab */}
                      <TabsContent value="boleto" className="space-y-4 mt-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                          <p className="text-sm text-amber-100">
                            ✓ Boleto bancário - Vencimento em 3 dias úteis
                          </p>
                        </div>
                      </TabsContent>

                      {/* Transfer Tab */}
                      <TabsContent value="transfer" className="space-y-4 mt-4">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                          <p className="text-sm text-cyan-100">
                            ✓ Transferência bancária - Válida para qualquer banco
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Security Info */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-sm font-semibold text-green-100">Pagamento 100% Seguro</p>
                      <p className="text-xs text-green-100/80 mt-1">
                        Seus dados são criptografados e processados pelo MercadoPago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Button */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Finalizar Pagamento</CardTitle>
                  <CardDescription>Clique para continuar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-primary">Total a pagar</p>
                    <p className="text-2xl font-bold text-primary mt-1">R$ {coursePrice.toFixed(2)}</p>
                  </div>

                  <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors">
                    {isProcessing ? (<>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                        Processando...
                      </>) : (<>
                        <CreditCard className="w-4 h-4 mr-2"/>
                        Ir para Pagamento
                      </>)}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Você será redirecionado para o MercadoPago
                  </p>

                  {/* Payment Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-100">
                      <strong>Métodos disponíveis:</strong>
                    </p>
                    <ul className="text-xs text-blue-100/80 mt-2 space-y-1">
                      <li>✓ Cartão de crédito/débito</li>
                      <li>✓ PIX instantâneo</li>
                      <li>✓ Boleto bancário</li>
                      <li>✓ Transferência bancária</li>
                      <li>✓ Wallet do MercadoPago</li>
                    </ul>
                  </div>

                  {/* Security Badge */}
                  <div className="text-center text-xs text-muted-foreground">
                    <p>🔒 Pagamento seguro e criptografado</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>);
}
