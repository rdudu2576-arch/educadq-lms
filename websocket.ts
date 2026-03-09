import { WebSocketServer, WebSocket } from "ws";
import { eventBus } from "./utils/eventBus";

export function startWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WEBSOCKET] Admin conectado ao monitoramento");

    // Função listener para receber eventos
    const listener = (log: any) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(log));
        }
      } catch (err) {
        console.error("[WEBSOCKET] Error sending message:", err);
      }
    };

    // Registrar listener
    eventBus.on("systemLog", listener);

    // Enviar logs recentes quando conectar
    ws.send(JSON.stringify({
      type: "connected",
      message: "Conectado ao monitoramento em tempo real",
      timestamp: new Date().toISOString(),
    }));

    // Remover listener quando desconectar
    ws.on("close", () => {
      console.log("[WEBSOCKET] Admin desconectado");
      eventBus.off("systemLog", listener);
    });

    // Tratar erros
    ws.on("error", (err) => {
      console.error("[WEBSOCKET] Error:", err);
    });
  });

  console.log("[WEBSOCKET] WebSocket server started");
}
