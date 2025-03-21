// src/websocket.js
const WebSocket = require("ws");

let wss; // Referência ao WebSocket.Server
let connectedClients = []; // Armazena as conexões ativas

function initWsServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Novo cliente WebSocket conectado");
    connectedClients.push(ws);

    // Quando o cliente enviar alguma mensagem
    ws.on("message", (msg) => {
      console.log("Mensagem recebida do cliente:", msg);
      // Se quiser tratar mensagens específicas, faça aqui
    });

    // Quando o cliente se desconectar
    ws.on("close", () => {
      console.log("Cliente WebSocket desconectado");
      connectedClients = connectedClients.filter((c) => c !== ws);
    });
  });
}

// Envia data (objeto) para todos os clientes conectados
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
