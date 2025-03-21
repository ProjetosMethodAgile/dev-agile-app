// Exemplo: index.js ou server.js
require("dotenv").config();
const app = require("./src/app.js");
const https = require("https");
const fs = require("fs");
const { init } = require("./src/socket.js");

const PORT = 3001;
const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/devagile.com.br/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/devagile.com.br/fullchain.pem"),
};

const server = https.createServer(httpsOptions, app);

// Inicializa o Socket.IO
init(server);

server.listen(PORT, () => {
  console.log("Servidor de aplicação ligado na porta " + PORT);
});
