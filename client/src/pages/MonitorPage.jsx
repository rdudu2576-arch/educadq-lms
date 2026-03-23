var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "wouter";
export default function MonitorPage() {
    var _a = useState([]), logs = _a[0], setLogs = _a[1];
    var _b = useState(false), isConnected = _b[0], setIsConnected = _b[1];
    var _c = useState("all"), filterLevel = _c[0], setFilterLevel = _c[1];
    var user = useAuth().user;
    var _d = useRouter(), navigate = _d[1];
    // Verificar se é admin ou desenvolvedor
    useEffect(function () {
        if (user && user.role !== "admin" && user.role !== "desenvolvedor") {
            navigate("/403");
        }
    }, [user, navigate]);
    useEffect(function () {
        var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        var wsUrl = "".concat(protocol, "//").concat(window.location.host);
        console.log("[MONITOR] Conectando ao WebSocket:", wsUrl);
        var ws = new WebSocket(wsUrl);
        ws.onopen = function () {
            console.log("[MONITOR] Conectado ao servidor WebSocket");
            setIsConnected(true);
        };
        ws.onmessage = function (event) {
            try {
                var data_1 = JSON.parse(event.data);
                console.log("[MONITOR] Log recebido:", data_1);
                setLogs(function (prev) { return __spreadArray([data_1], prev, true).slice(0, 200); });
            }
            catch (err) {
                console.error("[MONITOR] Erro ao parsear mensagem:", err);
            }
        };
        ws.onerror = function (err) {
            console.error("[MONITOR] Erro WebSocket:", err);
            setIsConnected(false);
        };
        ws.onclose = function () {
            console.log("[MONITOR] Desconectado do servidor WebSocket");
            setIsConnected(false);
        };
        return function () {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);
    var filteredLogs = filterLevel === "all"
        ? logs
        : logs.filter(function (log) { return log.level === filterLevel; });
    var getLevelColor = function (level) {
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
    var getLevelTextColor = function (level) {
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
    return (<div className="min-h-screen bg-slate-900 p-6">
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
                <div className={"w-3 h-3 rounded-full ".concat(isConnected ? "bg-green-500" : "bg-red-500")}/>
                <span className="text-sm text-slate-300">
                  {isConnected ? "Conectado" : "Desconectado"}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filtros */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              <button onClick={function () { return setFilterLevel("all"); }} className={"px-4 py-2 rounded text-sm font-medium transition-colors ".concat(filterLevel === "all"
            ? "bg-cyan-600 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                Todos ({logs.length})
              </button>
              <button onClick={function () { return setFilterLevel("info"); }} className={"px-4 py-2 rounded text-sm font-medium transition-colors ".concat(filterLevel === "info"
            ? "bg-blue-600 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                Info ({logs.filter(function (l) { return l.level === "info"; }).length})
              </button>
              <button onClick={function () { return setFilterLevel("warning"); }} className={"px-4 py-2 rounded text-sm font-medium transition-colors ".concat(filterLevel === "warning"
            ? "bg-yellow-600 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                Warning ({logs.filter(function (l) { return l.level === "warning"; }).length})
              </button>
              <button onClick={function () { return setFilterLevel("error"); }} className={"px-4 py-2 rounded text-sm font-medium transition-colors ".concat(filterLevel === "error"
            ? "bg-red-600 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                Erro ({logs.filter(function (l) { return l.level === "error"; }).length})
              </button>
              <button onClick={function () { return setFilterLevel("security"); }} className={"px-4 py-2 rounded text-sm font-medium transition-colors ".concat(filterLevel === "security"
            ? "bg-purple-600 text-white"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                Security ({logs.filter(function (l) { return l.level === "security"; }).length})
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (<Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center text-slate-400">
                Nenhum log encontrado
              </CardContent>
            </Card>) : (filteredLogs.map(function (log, i) { return (<Card key={i} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={"".concat(getLevelColor(log.level), " text-white")}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-mono text-slate-400">{log.source}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={"text-sm ".concat(getLevelTextColor(log.level))}>
                        {log.message}
                      </p>
                      {log.metadata && (<div className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-400 font-mono overflow-auto max-h-32">
                          {typeof log.metadata === "string"
                    ? log.metadata
                    : JSON.stringify(log.metadata, null, 2)}
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>); }))}
        </div>
      </div>
    </div>);
}
