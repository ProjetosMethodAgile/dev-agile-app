// src/websocket.js
const WebSocket = require("ws");

let wss = null;
let connectedClients = [];

/**
 * Inicializa o servidor WebSocket usando o servidor HTTPS e define o path.
 * Adiciona lógica de heartbeat (ping/pong) para detectar conexões mortas.
 */
function initWsServer(server) {
  wss = new WebSocket.Server({ server, path: "/socket" });

  // A cada 30 segundos, verifica se os clientes responderam ao ping
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // Se o cliente não respondeu ao último ping, encerra a conexão
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(); // envia ping; aguarda pong
    });
  }, 30_000);

  wss.on("connection", (ws) => {
    console.log("Novo cliente WebSocket conectado");
    ws.isAlive = true;
    connectedClients.push(ws);

    ws.on("pong", () => {
      // Cliente respondeu ao ping
      ws.isAlive = true;
    });

    ws.on("message", (message) => {
      console.log("Mensagem recebida do cliente:", message);
    });

    ws.on("close", () => {
      console.log("Cliente WebSocket desconectado");
      connectedClients = connectedClients.filter((c) => c !== ws);
    });
  });

  // Ao fechar o servidor, limpa o interval de heartbeat
  wss.on("close", () => {
    clearInterval(interval);
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
