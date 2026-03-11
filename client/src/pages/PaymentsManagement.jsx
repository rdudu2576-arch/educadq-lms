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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Edit2, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
export default function PaymentsManagement() {
    var _a = useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = useState(null), editingId = _b[0], setEditingId = _b[1];
    var _c = useState({
        studentId: "",
        courseId: "",
        totalValue: "",
        paidValue: "",
        installments: "",
        dueDate: "",
        status: "pending",
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc.admin.getPaymentReport.useQuery(), paymentReport = _d.data, refetch = _d.refetch;
    var payments = (paymentReport === null || paymentReport === void 0 ? void 0 : paymentReport.overdueInstallments) || [];
    var updatePaymentMutation = trpc.admin.sendPaymentReminder.useMutation({
        onSuccess: function () {
            toast.success("Pagamento atualizado com sucesso!");
            resetForm();
            refetch();
        },
        onError: function (error) { return toast.error("Erro: ".concat((error === null || error === void 0 ? void 0 : error.message) || 'Erro desconhecido')); },
    });
    var resetForm = function () {
        setFormData({
            studentId: "",
            courseId: "",
            totalValue: "",
            paidValue: "",
            installments: "",
            dueDate: "",
            status: "pending",
        });
        setEditingId(null);
        setIsOpen(false);
    };
    var handleSubmit = function () {
        if (!formData.studentId || !formData.courseId || !formData.totalValue) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }
        if (editingId) {
            updatePaymentMutation.mutate({
                installmentId: editingId,
            });
        }
    };
    var handleEdit = function (payment) {
        var _a, _b, _c, _d, _e, _f;
        setFormData({
            studentId: ((_a = payment.studentId) === null || _a === void 0 ? void 0 : _a.toString()) || "",
            courseId: ((_b = payment.courseId) === null || _b === void 0 ? void 0 : _b.toString()) || "",
            totalValue: ((_c = payment.totalValue) === null || _c === void 0 ? void 0 : _c.toString()) || "",
            paidValue: ((_d = payment.paidValue) === null || _d === void 0 ? void 0 : _d.toString()) || "",
            installments: ((_e = payment.installments) === null || _e === void 0 ? void 0 : _e.toString()) || "",
            dueDate: ((_f = payment.dueDate) === null || _f === void 0 ? void 0 : _f.toString()) || "",
            status: payment.status || "pending",
        });
        setEditingId(payment.id);
        setIsOpen(true);
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "paid":
                return "bg-green-900 text-green-200";
            case "overdue":
                return "bg-red-900 text-red-200";
            default:
                return "bg-yellow-900 text-yellow-200";
        }
    };
    var getStatusLabel = function (status) {
        switch (status) {
            case "paid":
                return "Pago";
            case "overdue":
                return "Atrasado";
            default:
                return "Pendente";
        }
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Pagamentos</h2>
          <p className="text-slate-400">Monitore e gerencie todos os pagamentos</p>
        </div>
        <Button onClick={function () {
            resetForm();
            setIsOpen(true);
        }} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2"/>
          Novo Pagamento
        </Button>
      </div>

      {/* Resumo de Pagamentos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Pendente</p>
              <p className="text-2xl font-bold text-yellow-400">
                R$ {payments.filter(function (p) { return p.status === "pending"; }).reduce(function (sum, p) { return sum + (parseFloat(p.value) || 0); }, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Pago</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {payments.filter(function (p) { return p.status === "paid"; }).reduce(function (sum, p) { return sum + (parseFloat(p.value) || 0); }, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Atrasado</p>
              <p className="text-2xl font-bold text-red-400">
                R$ {payments.filter(function (p) { return p.status === "overdue"; }).reduce(function (sum, p) { return sum + (parseFloat(p.value) || 0); }, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Geral</p>
              <p className="text-2xl font-bold text-cyan-400">
                R$ {payments.reduce(function (sum, p) { return sum + (parseFloat(p.value) || 0); }, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <div className="space-y-4">
        {payments.length === 0 ? (<Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center text-slate-400">
              Nenhum pagamento cadastrado
            </CardContent>
          </Card>) : (payments.map(function (payment) { return (<Card key={payment.id} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">Aluno ID: {payment.studentId}</h3>
                      <span className={"px-3 py-1 rounded-full text-xs font-medium ".concat(getStatusColor(payment.status))}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Valor da Parcela</p>
                        <p className="text-white font-semibold">R$ {parseFloat(payment.value).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Número da Parcela</p>
                        <p className="text-white font-semibold">{payment.installmentNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Vencimento</p>
                        <p className="text-white font-semibold">
                          {payment.dueDate ? format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Data de Pagamento</p>
                        <p className="text-white font-semibold">
                          {payment.paidDate ? format(new Date(payment.paidDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                        </p>
                      </div>
                    </div>
                    {payment.status === "overdue" && (<div className="mt-3 flex items-center gap-2 p-2 bg-red-900/20 border border-red-700 rounded text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4"/>
                        Pagamento em atraso
                      </div>)}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={function () { return handleEdit(payment); }} className="text-white border-slate-600 hover:bg-slate-700">
                      <Edit2 className="w-4 h-4"/>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>); }))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Editar Pagamento" : "Novo Pagamento"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingId ? "Atualize os dados do pagamento" : "Registre um novo pagamento"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-white">
                  ID do Aluno
                </Label>
                <Input id="studentId" type="number" value={formData.studentId} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { studentId: e.target.value })); }} placeholder="123" className="bg-slate-700 border-slate-600 text-white"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId" className="text-white">
                  ID do Curso
                </Label>
                <Input id="courseId" type="number" value={formData.courseId} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { courseId: e.target.value })); }} placeholder="456" className="bg-slate-700 border-slate-600 text-white"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalValue" className="text-white">
                  Valor Total (R$)
                </Label>
                <Input id="totalValue" type="number" step="0.01" value={formData.totalValue} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { totalValue: e.target.value })); }} placeholder="1000.00" className="bg-slate-700 border-slate-600 text-white"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidValue" className="text-white">
                  Valor Pago (R$)
                </Label>
                <Input id="paidValue" type="number" step="0.01" value={formData.paidValue} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { paidValue: e.target.value })); }} placeholder="0.00" className="bg-slate-700 border-slate-600 text-white"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments" className="text-white">
                  Parcelas
                </Label>
                <Input id="installments" type="number" value={formData.installments} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { installments: e.target.value })); }} placeholder="3" className="bg-slate-700 border-slate-600 text-white"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={function (status) { return setFormData(__assign(__assign({}, formData), { status: status })); }}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="pending" className="text-white">Pendente</SelectItem>
                    <SelectItem value="paid" className="text-white">Pago</SelectItem>
                    <SelectItem value="overdue" className="text-white">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-white">
                Data de Vencimento
              </Label>
              <Input id="dueDate" type="date" value={formData.dueDate} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { dueDate: e.target.value })); }} className="bg-slate-700 border-slate-600 text-white"/>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={updatePaymentMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="text-white border-slate-600 hover:bg-slate-700">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);
}
