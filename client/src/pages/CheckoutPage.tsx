import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle, Copy, QrCode, CreditCard, Banknote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CheckoutPageProps {
  params?: {
    courseId?: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const courseId = params?.courseId ? parseInt(params.courseId) : null;
  const [installments, setInstallments] = useState(1);
  const [pixKey] = useState("41988913431");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "stripe" | "mercadopago">("pix");

  // Fetch course details
  const { data: course, isLoading: courseLoading } = trpc.courses.getById.useQuery(
    { courseId: courseId || 0 },
    { enabled: !!courseId }
  );

  // Create payment mutation
  const createPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      setLocation("/pagamento-confirmado");
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error("Erro ao criar pagamento:", error);
    },
  });

  // Note: Stripe and MercadoPago integrations are available via API endpoints

  // Enroll student mutation
  const enrollMutation = trpc.courses.enroll.useMutation({
    onSuccess: () => {
      // After enrollment, redirect to course
      setLocation(`/student`);
    },
    onError: (error) => {
      console.error("Erro ao matricular:", error);
    },
  });

  if (authLoading || courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Curso não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O curso que você está tentando acessar não foi encontrado.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const coursePrice = parseFloat(course.price);
  const installmentPrice = coursePrice / installments;
  const totalPrice = coursePrice;

  const handlePayment = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      await createPaymentMutation.mutateAsync({
        courseId: course.id,
        amount: course.price,
        installments,
        pixKey,
      });

      await enrollMutation.mutateAsync({
        courseId: course.id,
      });
    } catch (error) {
      console.error("Erro no checkout:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SEO
        title={`Checkout - ${course.title}`}
        description={`Complete seu pagamento para acessar o curso ${course.title} na plataforma EducaDQ.`}
      />
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
                    {course.coverUrl && (
                      <img
                        src={course.coverUrl}
                        alt={course.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
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
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setInstallments(num)}
                          className={`py-2 px-3 rounded-lg border transition-colors ${
                            installments === num
                              ? "bg-primary text-white border-primary"
                              : "bg-background border-border text-foreground hover:border-primary"
                          }`}
                        >
                          {num}x
                        </button>
                      ))}
                    </div>
                    {installments > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {installments}x de R$ {installmentPrice.toFixed(2)}
                      </p>
                    )}
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
                  <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="w-full">
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
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Copiar chave PIX"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
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
                        <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          QR Code será gerado após confirmação
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
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
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : paymentMethod === "stripe" ? (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar com Stripe - R$ {totalPrice.toFixed(2)}
                      </>
                    ) : paymentMethod === "mercadopago" ? (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar com MercadoPago - R$ {totalPrice.toFixed(2)}
                      </>
                    ) : (
                      `Confirmar Pagamento PIX - R$ ${totalPrice.toFixed(2)}`
                    )}
                  </Button>

                  {/* Payment Info */}
                  {paymentMethod === "stripe" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-100">
                        ✓ Cartão de crédito/débito - Parcelamento disponível
                      </p>
                    </div>
                  )}
                  {paymentMethod === "mercadopago" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-100">
                        ✓ Múltiplas opções: Cartão, PIX, Boleto, Transferência
                      </p>
                    </div>
                  )}

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
    </>
  );
}
