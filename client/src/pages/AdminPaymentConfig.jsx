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
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Settings, Shield } from "lucide-react";
export function AdminPaymentConfig() {
    var _this = this;
    var _a = useState("mercado_pago"), activeProvider = _a[0], setActiveProvider = _a[1];
    var _b = useState(""), apiKey = _b[0], setApiKey = _b[1];
    var _c = useState(""), publicKey = _c[0], setPublicKey = _c[1];
    var _d = useState(""), webhookSecret = _d[0], setWebhookSecret = _d[1];
    var _e = useState("12"), maxInstallments = _e[0], setMaxInstallments = _e[1];
    var _f = useState("2.99"), feePercentage = _f[0], setFeePercentage = _f[1];
    var _g = useState(false), isLoading = _g[0], setIsLoading = _g[1];
    var _h = useState(null), testResult = _h[0], setTestResult = _h[1];
    var providers = [
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
    var handleTestConnection = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/api/trpc/payments.testProviderConnection", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                providerId: activeProvider,
                                apiKey: apiKey,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        setTestResult({ success: true, message: "Conexão bem-sucedida!" });
                    }
                    else {
                        setTestResult({ success: false, message: "Falha na conexão. Verifique as credenciais." });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setTestResult({ success: false, message: "Erro ao testar conexão." });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveConfiguration = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/api/trpc/payments.updateProvider", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                providerId: activeProvider,
                                apiKey: apiKey,
                                publicKey: publicKey,
                                webhookSecret: webhookSecret,
                                maxInstallments: parseInt(maxInstallments),
                                feePercentage: feePercentage,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        setTestResult({ success: true, message: "Configuração salva com sucesso!" });
                    }
                    else {
                        setTestResult({ success: false, message: "Erro ao salvar configuração." });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    setTestResult({ success: false, message: "Erro ao salvar configuração." });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleSwitchProvider = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, fetch("/api/trpc/payments.switchActiveProvider", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                providerId: activeProvider,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        setTestResult({ success: true, message: "Provedor alterado com sucesso!" });
                    }
                    else {
                        setTestResult({ success: false, message: "Erro ao alterar provedor." });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    setTestResult({ success: false, message: "Erro ao alterar provedor." });
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Pagamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie seus provedores de pagamento</p>
        </div>
        <Shield className="w-8 h-8 text-blue-600"/>
      </div>

      <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {providers.map(function (provider) { return (<TabsTrigger key={provider.id} value={provider.id}>
              {provider.name}
            </TabsTrigger>); })}
        </TabsList>

        {providers.map(function (provider) { return (<TabsContent key={provider.id} value={provider.id} className="space-y-4">
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
                    {provider.methods.map(function (method) { return (<span key={method} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {method}
                      </span>); })}
                  </div>
                </div>

                {/* Campos de configuração */}
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" type="password" placeholder="Cole sua API Key" value={apiKey} onChange={function (e) { return setApiKey(e.target.value); }} className="mt-1"/>
                  </div>

                  {provider.id !== "paypal" && (<div>
                      <Label htmlFor="publicKey">Public Key</Label>
                      <Input id="publicKey" type="password" placeholder="Cole sua Public Key" value={publicKey} onChange={function (e) { return setPublicKey(e.target.value); }} className="mt-1"/>
                    </div>)}

                  <div>
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Input id="webhookSecret" type="password" placeholder="Cole seu Webhook Secret" value={webhookSecret} onChange={function (e) { return setWebhookSecret(e.target.value); }} className="mt-1"/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxInstallments">Máx. Parcelas</Label>
                      <Select value={maxInstallments} onValueChange={setMaxInstallments}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 6, 8, 10, 12].map(function (num) { return (<SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>); })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="feePercentage">Taxa (%)</Label>
                      <Input id="feePercentage" type="number" step="0.01" placeholder="2.99" value={feePercentage} onChange={function (e) { return setFeePercentage(e.target.value); }} className="mt-1"/>
                    </div>
                  </div>
                </div>

                {/* Resultado do teste */}
                {testResult && (<div className={"p-4 rounded-lg flex items-center gap-2 ".concat(testResult.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800")}>
                    {testResult.success ? (<CheckCircle2 className="w-5 h-5"/>) : (<AlertCircle className="w-5 h-5"/>)}
                    <span>{testResult.message}</span>
                  </div>)}

                {/* Botões de ação */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleTestConnection} variant="outline" disabled={isLoading || !apiKey}>
                    Testar Conexão
                  </Button>
                  <Button onClick={handleSaveConfiguration} disabled={isLoading || !apiKey}>
                    Salvar Configuração
                  </Button>
                  <Button onClick={handleSwitchProvider} variant="default" disabled={isLoading || !apiKey}>
                    Ativar Este Provedor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>); })}
      </Tabs>

      {/* Histórico de mudanças */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5"/>
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
              <CheckCircle2 className="w-5 h-5 text-green-600"/>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold">Configuração atualizada</p>
                <p className="text-sm text-gray-600">Admin • 1 dia atrás</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600"/>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}
