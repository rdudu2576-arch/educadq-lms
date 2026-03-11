import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Settings, Shield } from "lucide-react";

export function AdminPaymentConfig() {
  const [activeProvider, setActiveProvider] = useState("mercado_pago");
  const [apiKey, setApiKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [maxInstallments, setMaxInstallments] = useState("12");
  const [feePercentage, setFeePercentage] = useState("2.99");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const providers = [
    {
      id: "mercado_pago",
      name: "Mercado Pago",
      description: "Integração com Mercado Pago",
      methods: ["Cartão de Crédito", "Cartão de Débito", "PIX", "Boleto"],
      fee: "2.99%",
      maxInstallments: 12,
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Integração com Stripe",
      methods: ["Cartão de Crédito", "Cartão de Débito"],
      fee: "2.90%",
      maxInstallments: 12,
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Integração com PayPal",
      methods: ["Cartão de Crédito", "PayPal Wallet"],
      fee: "3.49%",
      maxInstallments: 12,
    },
  ];

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Simular teste de conexão
      const response = await fetch("/api/trpc/payments.testProviderConnection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: activeProvider,
          apiKey,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: "Conexão bem-sucedida!" });
      } else {
        setTestResult({ success: false, message: "Falha na conexão. Verifique as credenciais." });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Erro ao testar conexão." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Salvar configuração
      const response = await fetch("/api/trpc/payments.updateProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: activeProvider,
          apiKey,
          publicKey,
          webhookSecret,
          maxInstallments: parseInt(maxInstallments),
          feePercentage,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: "Configuração salva com sucesso!" });
      } else {
        setTestResult({ success: false, message: "Erro ao salvar configuração." });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Erro ao salvar configuração." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchProvider = async () => {
    setIsLoading(true);
    try {
      // Trocar provedor ativo
      const response = await fetch("/api/trpc/payments.switchActiveProvider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: activeProvider,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: "Provedor alterado com sucesso!" });
      } else {
        setTestResult({ success: false, message: "Erro ao alterar provedor." });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Erro ao alterar provedor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Pagamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie seus provedores de pagamento</p>
        </div>
        <Shield className="w-8 h-8 text-blue-600" />
      </div>

      <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {providers.map((provider) => (
            <TabsTrigger key={provider.id} value={provider.id}>
              {provider.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {providers.map((provider) => (
          <TabsContent key={provider.id} value={provider.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{provider.name}</CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informações do provedor */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Taxa</p>
                    <p className="font-semibold">{provider.fee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Máx. Parcelas</p>
                    <p className="font-semibold">{provider.maxInstallments}x</p>
                  </div>
                </div>

                {/* Métodos suportados */}
                <div>
                  <Label className="text-sm font-semibold">Métodos de Pagamento</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.methods.map((method) => (
                      <span
                        key={method}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Campos de configuração */}
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Cole sua API Key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {provider.id !== "paypal" && (
                    <div>
                      <Label htmlFor="publicKey">Public Key</Label>
                      <Input
                        id="publicKey"
                        type="password"
                        placeholder="Cole sua Public Key"
                        value={publicKey}
                        onChange={(e) => setPublicKey(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      placeholder="Cole seu Webhook Secret"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxInstallments">Máx. Parcelas</Label>
                      <Select value={maxInstallments} onValueChange={setMaxInstallments}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 6, 8, 10, 12].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="feePercentage">Taxa (%)</Label>
                      <Input
                        id="feePercentage"
                        type="number"
                        step="0.01"
                        placeholder="2.99"
                        value={feePercentage}
                        onChange={(e) => setFeePercentage(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Resultado do teste */}
                {testResult && (
                  <div
                    className={`p-4 rounded-lg flex items-center gap-2 ${
                      testResult.success
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleTestConnection}
                    variant="outline"
                    disabled={isLoading || !apiKey}
                  >
                    Testar Conexão
                  </Button>
                  <Button
                    onClick={handleSaveConfiguration}
                    disabled={isLoading || !apiKey}
                  >
                    Salvar Configuração
                  </Button>
                  <Button
                    onClick={handleSwitchProvider}
                    variant="default"
                    disabled={isLoading || !apiKey}
                  >
                    Ativar Este Provedor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Histórico de mudanças */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Histórico de Mudanças
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">Mercado Pago ativado</p>
                <p className="text-sm text-gray-600">Admin • 2 horas atrás</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">Configuração atualizada</p>
                <p className="text-sm text-gray-600">Admin • 1 dia atrás</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
