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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, RefreshCw, TrendingUp, Download, Pause, Play, } from "lucide-react";
export function AdminRetryMonitoring() {
    var _this = this;
    var _a = useState([]), retries = _a[0], setRetries = _a[1];
    var _b = useState(null), stats = _b[0], setStats = _b[1];
    var _c = useState("all"), filter = _c[0], setFilter = _c[1];
    var _d = useState(""), searchStudent = _d[0], setSearchStudent = _d[1];
    var _e = useState(false), isLoading = _e[0], setIsLoading = _e[1];
    useEffect(function () {
        loadRetries();
        loadStats();
    }, [filter]);
    var loadRetries = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockRetries;
        return __generator(this, function (_a) {
            setIsLoading(true);
            try {
                mockRetries = [
                    {
                        id: 1,
                        paymentId: 101,
                        studentId: 1,
                        studentName: "João Silva",
                        amount: "299.90",
                        status: "pending",
                        retryCount: 1,
                        maxRetries: 5,
                        nextRetryAt: new Date(Date.now() + 3600000),
                        lastError: "Card declined",
                        createdAt: new Date(Date.now() - 86400000),
                    },
                    {
                        id: 2,
                        paymentId: 102,
                        studentId: 2,
                        studentName: "Maria Santos",
                        amount: "199.90",
                        status: "processing",
                        retryCount: 2,
                        maxRetries: 5,
                        nextRetryAt: new Date(Date.now() + 7200000),
                        lastError: "Timeout",
                        createdAt: new Date(Date.now() - 172800000),
                    },
                    {
                        id: 3,
                        paymentId: 103,
                        studentId: 3,
                        studentName: "Pedro Costa",
                        amount: "399.90",
                        status: "success",
                        retryCount: 3,
                        maxRetries: 5,
                        nextRetryAt: null,
                        lastError: null,
                        createdAt: new Date(Date.now() - 259200000),
                    },
                ];
                setRetries(mockRetries);
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockStats;
        return __generator(this, function (_a) {
            try {
                mockStats = {
                    totalRetries: 156,
                    successfulRetries: 132,
                    failedRetries: 18,
                    abandonedRetries: 6,
                    successRate: 84.6,
                    totalAmountRecovered: 39750.5,
                    averageRetryCount: 2.3,
                    pendingRetries: 12,
                };
                setStats(mockStats);
            }
            catch (error) {
                console.error("Error loading stats:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleProcessRetryNow = function (retryId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Chamar API para processar retry
                console.log("Processing retry:", retryId);
                loadRetries();
            }
            catch (error) {
                console.error("Error processing retry:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleCancelRetry = function (retryId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Chamar API para cancelar retry
                console.log("Cancelling retry:", retryId);
                loadRetries();
            }
            catch (error) {
                console.error("Error cancelling retry:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var handleResendNotification = function (retryId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // Chamar API para reenviar notificação
                console.log("Resending notification for retry:", retryId);
            }
            catch (error) {
                console.error("Error resending notification:", error);
            }
            return [2 /*return*/];
        });
    }); };
    var getStatusBadge = function (status) {
        var statusMap = {
            pending: { label: "Pendente", variant: "outline", icon: Clock },
            processing: { label: "Processando", variant: "secondary", icon: RefreshCw },
            success: { label: "Sucesso", variant: "default", icon: CheckCircle2 },
            failed: { label: "Falha", variant: "destructive", icon: AlertCircle },
            abandoned: { label: "Abandonado", variant: "secondary", icon: AlertCircle },
        };
        var config = statusMap[status] || statusMap.pending;
        var Icon = config.icon;
        return (<Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3"/>
        {config.label}
      </Badge>);
    };
    var filteredRetries = retries.filter(function (retry) {
        if (filter !== "all" && retry.status !== filter)
            return false;
        if (searchStudent && !retry.studentName.toLowerCase().includes(searchStudent.toLowerCase()))
            return false;
        return true;
    });
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Retries</h1>
          <p className="text-gray-600 mt-2">Acompanhe tentativas de reprocessamento de pagamentos</p>
        </div>
        <RefreshCw className="w-8 h-8 text-blue-600"/>
      </div>

      {/* Estatísticas */}
      {stats && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.successfulRetries} de {stats.totalRetries} retries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Recuperado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalAmountRecovered.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">Última 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retries Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRetries}</div>
              <p className="text-xs text-gray-600 mt-1">Aguardando processamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Média de Tentativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRetryCount}</div>
              <p className="text-xs text-gray-600 mt-1">Por pagamento</p>
            </CardContent>
          </Card>
        </div>)}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                  <SelectItem value="abandoned">Abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Buscar Aluno</Label>
              <Input placeholder="Nome do aluno..." value={searchStudent} onChange={function (e) { return setSearchStudent(e.target.value); }} className="mt-1"/>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={loadRetries} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2"/>
                Atualizar
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2"/>
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Retries */}
      <Card>
        <CardHeader>
          <CardTitle>Tentativas de Reprocessamento</CardTitle>
          <CardDescription>{filteredRetries.length} registros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Próxima Tentativa</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRetries.map(function (retry) { return (<TableRow key={retry.id}>
                    <TableCell className="font-mono text-sm">#{retry.id}</TableCell>
                    <TableCell>{retry.studentName}</TableCell>
                    <TableCell className="font-semibold">R$ {retry.amount}</TableCell>
                    <TableCell>{getStatusBadge(retry.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{
                width: "".concat((retry.retryCount / retry.maxRetries) * 100, "%"),
            }}/>
                        </div>
                        <span className="text-sm">
                          {retry.retryCount}/{retry.maxRetries}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {retry.nextRetryAt
                ? new Date(retry.nextRetryAt).toLocaleString("pt-BR")
                : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-red-600">{retry.lastError || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {retry.status === "pending" && (<Button size="sm" variant="outline" onClick={function () { return handleProcessRetryNow(retry.id); }}>
                            <Play className="w-3 h-3"/>
                          </Button>)}
                        {retry.status !== "success" && retry.status !== "abandoned" && (<Button size="sm" variant="outline" onClick={function () { return handleCancelRetry(retry.id); }}>
                            <Pause className="w-3 h-3"/>
                          </Button>)}
                        <Button size="sm" variant="outline" onClick={function () { return handleResendNotification(retry.id); }}>
                          Notificar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>); })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5"/>
            Tendência de Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-600">Gráfico de tendência será exibido aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>);
}
