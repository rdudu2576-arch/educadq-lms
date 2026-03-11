import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  Download,
  Pause,
  Play,
} from "lucide-react";

export function AdminRetryMonitoring() {
  const [retries, setRetries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRetries();
    loadStats();
  }, [filter]);

  const loadRetries = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      const mockRetries = [
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
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simular carregamento de estatísticas
      const mockStats = {
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
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleProcessRetryNow = async (retryId: number) => {
    try {
      // Chamar API para processar retry
      console.log("Processing retry:", retryId);
      loadRetries();
    } catch (error) {
      console.error("Error processing retry:", error);
    }
  };

  const handleCancelRetry = async (retryId: number) => {
    try {
      // Chamar API para cancelar retry
      console.log("Cancelling retry:", retryId);
      loadRetries();
    } catch (error) {
      console.error("Error cancelling retry:", error);
    }
  };

  const handleResendNotification = async (retryId: number) => {
    try {
      // Chamar API para reenviar notificação
      console.log("Resending notification for retry:", retryId);
    } catch (error) {
      console.error("Error resending notification:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string; icon: any }> = {
      pending: { label: "Pendente", variant: "outline", icon: Clock },
      processing: { label: "Processando", variant: "secondary", icon: RefreshCw },
      success: { label: "Sucesso", variant: "default", icon: CheckCircle2 },
      failed: { label: "Falha", variant: "destructive", icon: AlertCircle },
      abandoned: { label: "Abandonado", variant: "secondary", icon: AlertCircle },
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredRetries = retries.filter((retry) => {
    if (filter !== "all" && retry.status !== filter) return false;
    if (searchStudent && !retry.studentName.toLowerCase().includes(searchStudent.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Retries</h1>
          <p className="text-gray-600 mt-2">Acompanhe tentativas de reprocessamento de pagamentos</p>
        </div>
        <RefreshCw className="w-8 h-8 text-blue-600" />
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>
      )}

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
              <Input
                placeholder="Nome do aluno..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={loadRetries} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
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
                {filteredRetries.map((retry) => (
                  <TableRow key={retry.id}>
                    <TableCell className="font-mono text-sm">#{retry.id}</TableCell>
                    <TableCell>{retry.studentName}</TableCell>
                    <TableCell className="font-semibold">R$ {retry.amount}</TableCell>
                    <TableCell>{getStatusBadge(retry.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width: `${(retry.retryCount / retry.maxRetries) * 100}%`,
                            }}
                          />
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
                        {retry.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcessRetryNow(retry.id)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        {retry.status !== "success" && retry.status !== "abandoned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelRetry(retry.id)}
                          >
                            <Pause className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendNotification(retry.id)}
                        >
                          Notificar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendência de Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-600">Gráfico de tendência será exibido aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
