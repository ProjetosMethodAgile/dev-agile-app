// server.js
require("dotenv").config();
const fs = require("fs");
const https = require("https");
const app = require("./src/app.js");
const { initWsServer } = require("./src/websocket.js")

const PORT = 3001;
const httpsOptions = {
 key: fs.readFileSync("/etc/letsencrypt/live/devagile.com.br/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/devagile.com.br/fullchain.pem"), 
};


const server = https.createServer(httpsOptions, app);

// Inicializa o WebSocket com path '/api/socket'
initWsServer(app);

server.listen(PORT, () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});
