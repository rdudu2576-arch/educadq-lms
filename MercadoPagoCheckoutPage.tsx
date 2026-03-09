import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, CheckCircle, Copy, QrCode, CreditCard, Banknote, Landmark, Building2 } from "lucide-react";

interface MercadoPagoCheckoutPageProps {
  params?: {
    courseId?: string;
  };
}

export default function MercadoPagoCheckoutPage({ params }: MercadoPagoCheckoutPageProps) {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const courseId = params?.courseId ? parseInt(params.courseId) : null;
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"checkout" | "card" | "pix" | "boleto" | "transfer">("checkout");
  const [installments, setInstallments] = useState(1);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = trpc.courses.getById.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  // Mutations
  const checkoutMutation = trpc.mercadopago.createCheckout.useMutation({
    onSuccess: (data) => {
      window.open(data.checkoutUrl, "_blank");
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error("Erro:", error);
      setIsProcessing(false);
    },
  });

  const cardPaymentMutation = trpc.mercadopago.createCardPayment.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      setLocation("/pagamento-confirmado");
    },
    onError: (error) => {
      console.error("Erro:", error);
      setIsProcessing(false);
    },
  });

  const pixPaymentMutation = trpc.mercadopago.createPixPayment.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      setLocation("/pagamento-pix");
    },
    onError: (error) => {
      console.error("Erro:", error);
      setIsProcessing(false);
    },
  });

  const boletoPaymentMutation = trpc.mercadopago.createBoletoPayment.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      setLocation("/pagamento-boleto");
    },
    onError: (error) => {
      console.error("Erro:", error);
      setIsProcessing(false);
    },
  });

  const transferPaymentMutation = trpc.mercadopago.createTransferPayment.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      setLocation("/pagamento-transferencia");
    },
    onError: (error) => {
      console.error("Erro:", error);
      setIsProcessing(false);
    },
  });

  if (authLoading || courseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Curso não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const coursePrice = parseFloat(course.price);
  const installmentPrice = coursePrice / installments;

  const handlePayment = async () => {
    if (!user || !course) return;

    setIsProcessing(true);

    try {
      if (paymentMethod === "checkout") {
        await checkoutMutation.mutateAsync({
          courseId: course.id,
          courseName: course.title,
          coursePrice: coursePrice,
          installments,
        });
      } else if (paymentMethod === "card") {
        await cardPaymentMutation.mutateAsync({
          courseId: course.id,
          courseName: course.title,
          coursePrice: coursePrice,
          cardToken: "token_placeholder",
          installments,
        });
      } else if (paymentMethod === "pix") {
        await pixPaymentMutation.mutateAsync({
          courseId: course.id,
          courseName: course.title,
          coursePrice: coursePrice,
        });
      } else if (paymentMethod === "boleto") {
        await boletoPaymentMutation.mutateAsync({
          courseId: course.id,
          courseName: course.title,
          coursePrice: coursePrice,
        });
      } else if (paymentMethod === "transfer") {
        await transferPaymentMutation.mutateAsync({
          courseId: course.id,
          courseName: course.title,
          coursePrice: coursePrice,
        });
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
    }
  };

  return (
    <>
      <SEO
        title={`Checkout - ${course.title}`}
        description={`Finalize seu pagamento para acessar o curso ${course.title}`}
      />

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
                    {paymentMethod === "card" && installments > 1 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parcelamento ({installments}x)</span>
                        <span className="font-semibold">R$ {installmentPrice.toFixed(2)} cada</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">R$ {coursePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4 pt-6">
                    <h4 className="font-semibold text-foreground">Escolha seu método de pagamento</h4>

                    <Tabs
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as any)}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-5 gap-1">
                        <TabsTrigger value="checkout" className="text-xs">
                          <Banknote className="w-4 h-4 mr-1" />
                          Todos
                        </TabsTrigger>
                        <TabsTrigger value="card" className="text-xs">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Cartão
                        </TabsTrigger>
                        <TabsTrigger value="pix" className="text-xs">
                          <QrCode className="w-4 h-4 mr-1" />
                          PIX
                        </TabsTrigger>
                        <TabsTrigger value="boleto" className="text-xs">
                          <Landmark className="w-4 h-4 mr-1" />
                          Boleto
                        </TabsTrigger>
                        <TabsTrigger value="transfer" className="text-xs">
                          <Building2 className="w-4 h-4 mr-1" />
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
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                          >
                            {[1, 2, 3, 4, 6, 12].map((num) => (
                              <option key={num} value={num}>
                                {num}x de R$ {(coursePrice / num).toFixed(2)}
                              </option>
                            ))}
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
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
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

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Ir para Pagamento
                      </>
                    )}
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
    </>
  );
}
