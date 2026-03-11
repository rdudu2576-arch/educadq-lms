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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
export default function MercadopagoIntegration() {
    var _this = this;
    var _a = useState({
        enrollmentId: "",
        amount: "",
        paymentMethod: "credit_card",
    }), paymentData = _a[0], setPaymentData = _a[1];
    var _b = useState("idle"), paymentStatus = _b[0], setPaymentStatus = _b[1];
    var handlePaymentSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            setPaymentStatus("processing");
            // Simulação de processamento de pagamento
            setTimeout(function () {
                setPaymentStatus("success");
            }, 2000);
            return [2 /*return*/];
        });
    }); };
    var paymentMethods = [
        { id: "credit_card", label: "Cartão de Crédito" },
        { id: "debit_card", label: "Cartão de Débito" },
        { id: "pix", label: "PIX" },
        { id: "boleto", label: "Boleto Bancário" },
    ];
    return (<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pagamento com MercadoPago</h1>
          <p className="text-slate-600">Processe pagamentos de forma segura e rápida</p>
        </div>

        {/* Payment Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={24}/>
              Dados do Pagamento
            </CardTitle>
            <CardDescription>Preencha os dados para processar o pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Enrollment ID */}
              <div className="space-y-2">
                <Label htmlFor="enrollmentId">ID da Matrícula</Label>
                <Input id="enrollmentId" type="number" placeholder="Ex: 12345" value={paymentData.enrollmentId} onChange={function (e) {
            return setPaymentData(__assign(__assign({}, paymentData), { enrollmentId: e.target.value }));
        }} required/>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" type="number" placeholder="Ex: 99.90" step="0.01" value={paymentData.amount} onChange={function (e) { return setPaymentData(__assign(__assign({}, paymentData), { amount: e.target.value })); }} required/>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="method">Método de Pagamento</Label>
                <Select value={paymentData.paymentMethod} onValueChange={function (value) {
            return setPaymentData(__assign(__assign({}, paymentData), { paymentMethod: value }));
        }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(function (method) { return (<SelectItem key={method.id} value={method.id}>
                        {method.label}
                      </SelectItem>); })}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={paymentStatus === "processing"}>
                {paymentStatus === "processing" ? "Processando..." : "Processar Pagamento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {paymentStatus === "success" && (<Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24}/>
                <div>
                  <h3 className="font-semibold text-green-900">Pagamento Aprovado!</h3>
                  <p className="text-sm text-green-700">
                    Seu pagamento foi processado com sucesso. ID da transação: MP-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>)}

        {paymentStatus === "error" && (<Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={24}/>
                <div>
                  <h3 className="font-semibold text-red-900">Erro no Pagamento</h3>
                  <p className="text-sm text-red-700">
                    Ocorreu um erro ao processar seu pagamento. Tente novamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>)}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Segurança</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Seus dados são criptografados e processados de forma segura pelo MercadoPago.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suporte</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Em caso de dúvidas, entre em contato com nosso suporte: suporte@educadq.com.br
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
