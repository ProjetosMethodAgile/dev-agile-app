// src/websocket.js
const WebSocket = require("ws");

let wss = null;
let connectedClients = [];

/**
 * Inicializa o servidor WebSocket usando o servidor HTTPS e define o path.
 */
function initWsServer(server) {
  wss = new WebSocket.Server({ server, path: "/socket" });

  wss.on("connection", (ws) => {
    console.log("Novo cliente WebSocket conectado");
    connectedClients.push(ws);

    ws.on("message", (message) => {
      console.log("Mensagem recebida do cliente:", message);
      // Aqui você pode tratar mensagens recebidas do cliente
    });

    ws.on("close", () => {
      console.log("Cliente WebSocket desconectado");
      connectedClients = connectedClients.filter((c) => c !== ws);
    });
  });
}

/**
 * Envia uma mensagem para todos os clientes conectados.
 */
function broadcast(data) {
  if (!wss) return;
  const payload = JSON.stringify(data);
  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

module.exports = {
  initWsServer,
  broadcast,
};
