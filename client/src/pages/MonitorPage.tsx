import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useRouter } from "wouter";

interface SystemLog {
  id: number;
  level: "info" | "warning" | "error" | "security";
  source: string;
  message: string;
  metadata?: any;
  userId?: number;
  createdAt: string;
}

export default function MonitorPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filterLevel, setFilterLevel] = useState<"all" | "info" | "warning" | "error" | "security">("all");
  const { user } = useAuth();
  const [, navigate] = useRouter();

  // Verificar se é admin ou desenvolvedor
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "desenvolvedor") {
      navigate("/403");
    }
  }, [user, navigate]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    
    console.log("[MONITOR] Conectando ao WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[MONITOR] Conectado ao servidor WebSocket");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[MONITOR] Log recebido:", data);
        
        setLogs((prev) => [data, ...prev].slice(0, 200));
      } catch (err) {
        console.error("[MONITOR] Erro ao parsear mensagem:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[MONITOR] Erro WebSocket:", err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("[MONITOR] Desconectado do servidor WebSocket");
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const filteredLogs = filterLevel === "all" 
    ? logs 
    : logs.filter(log => log.level === filterLevel);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "security":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-blue-300";
      case "warning":
        return "text-yellow-300";
      case "error":
        return "text-red-300";
      case "security":
        return "text-purple-300";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Monitoramento em Tempo Real</CardTitle>
                <CardDescription className="text-slate-400">
                  Acompanhe todos os eventos do sistema
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm text-slate-300">
                  {isConnected ? "Conectado" : "Desconectado"}
                </span>
              </div>
            </div>
          </CardHeader>
          {user?.role === "desenvolvedor" && (
            <CardContent className="border-t border-slate-700 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900 rounded-lg border border-cyan-500/30">
                  <p className="text-xs text-cyan-500 font-bold uppercase mb-1">Mock Data</p>
                  <p className="text-xs text-slate-400">Ativo</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-cyan-500/30">
                  <p className="text-xs text-cyan-500 font-bold uppercase mb-1">Performance</p>
                  <p className="text-xs text-slate-400">Normal (24ms)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-cyan-500/30">
                  <p className="text-xs text-cyan-500 font-bold uppercase mb-1">Network</p>
                  <p className="text-xs text-slate-400">Intercepter ON</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-cyan-500/30">
                  <p className="text-xs text-cyan-500 font-bold uppercase mb-1">State</p>
                  <p className="text-xs text-slate-400">Inspecting...</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Filtros */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterLevel("all")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterLevel === "all"
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Todos ({logs.length})
              </button>
              <button
                onClick={() => setFilterLevel("info")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterLevel === "info"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Info ({logs.filter(l => l.level === "info").length})
              </button>
              <button
                onClick={() => setFilterLevel("warning")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterLevel === "warning"
                    ? "bg-yellow-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Warning ({logs.filter(l => l.level === "warning").length})
              </button>
              <button
                onClick={() => setFilterLevel("error")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterLevel === "error"
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Erro ({logs.filter(l => l.level === "error").length})
              </button>
              <button
                onClick={() => setFilterLevel("security")}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterLevel === "security"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Security ({logs.filter(l => l.level === "security").length})
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center text-slate-400">
                Nenhum log encontrado
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getLevelColor(log.level)} text-white`}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-mono text-slate-400">{log.source}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`text-sm ${getLevelTextColor(log.level)}`}>
                        {log.message}
                      </p>
                      {log.metadata && (
                        <div className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-400 font-mono overflow-auto max-h-32">
                          {typeof log.metadata === "string"
                            ? log.metadata
                            : JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
