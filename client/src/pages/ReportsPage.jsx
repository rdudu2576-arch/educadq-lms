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
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
export default function ReportsPage(_a) {
    var _this = this;
    var params = _a.params;
    var _b = useAuth(), user = _b.user, loading = _b.loading;
    var _c = useLocation(), setLocation = _c[1];
    var _d = useState(false), isGenerating = _d[0], setIsGenerating = _d[1];
    var reportType = params.reportType;
    var generateMutation = trpc.admin.generateExcelReport.useMutation();
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    if (!user || user.role !== "admin") {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Acesso negado. Apenas administradores podem gerar relatórios.</p>
      </div>);
    }
    var handleGenerateReport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, link, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsGenerating(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, generateMutation.mutateAsync({
                            reportType: reportType,
                        })];
                case 2:
                    result = _a.sent();
                    link = document.createElement("a");
                    link.href = result.url;
                    link.download = "relatorio-".concat(reportType, ".xlsx");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    alert("Erro ao gerar relatório");
                    return [3 /*break*/, 5];
                case 4:
                    setIsGenerating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var reportConfig = {
        courses: {
            title: "Relatório de Cursos",
            description: "Taxa de conclusão, inscrições e receita por curso",
            fields: ["Curso", "Alunos Inscritos", "Alunos Concluídos", "Taxa de Conclusão", "Receita Total"],
        },
        students: {
            title: "Relatório de Alunos",
            description: "Progresso, desempenho e status de cada aluno",
            fields: ["Aluno", "Cursos Inscritos", "Cursos Concluídos", "Progresso Médio", "Última Atividade"],
        },
        payments: {
            title: "Relatório de Pagamentos",
            description: "Status de pagamentos, valores e datas",
            fields: ["Aluno", "Curso", "Valor Total", "Valor Pago", "Status", "Data"],
        },
        installments: {
            title: "Relatório de Parcelas",
            description: "Parcelas vencidas, pendentes e pagas",
            fields: ["Aluno", "Parcela", "Valor", "Data Vencimento", "Status", "Dias Atrasado"],
        },
    };
    var config = reportConfig[reportType];
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="text-slate-400 hover:text-white mb-4" onClick={function () { return setLocation("/admin"); }}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">{config.title}</h1>
          <p className="text-slate-400 mt-2">{config.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5"/>
                Campos Inclusos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {config.fields.map(function (field) { return (<li key={field} className="text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"/>
                    {field}
                  </li>); })}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Formato</p>
                <p className="text-white font-semibold">Excel (.xlsx)</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Atualização</p>
                <p className="text-white font-semibold">Em Tempo Real</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Período</p>
                <p className="text-white font-semibold">Todos os Dados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Prévia dos Dados</CardTitle>
            <CardDescription className="text-slate-400">
              Os dados abaixo são uma amostra do que será incluído no relatório
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700">
                    {config.fields.map(function (field) { return (<th key={field} className="text-left py-2 px-4 text-white font-semibold">
                        {field}
                      </th>); })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700">
                    {config.fields.map(function (_, i) { return (<td key={i} className="py-2 px-4">
                        <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-xs">
                          Dados...
                        </span>
                      </td>); })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={function () { return setLocation("/admin"); }}>
            Cancelar
          </Button>
          <Button onClick={handleGenerateReport} disabled={isGenerating} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
            {isGenerating ? (<>
                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                Gerando...
              </>) : (<>
                <Download className="w-4 h-4 mr-2"/>
                Gerar e Baixar Relatório
              </>)}
          </Button>
        </div>
      </div>
    </div>);
}
