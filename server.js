// server.js
require("dotenv").config();
const fs = require("fs");
const https = require("http");
const app = require("./src/app.js");
const { initWsServer } = require("./src/websocket.js");

const PORT = 3001;
const httpsOptions = {
  //  key: fs.readFileSync(process.env.LETSENCRIPT_PRIVKEY),
  //  cert: fs.readFileSync(process.env.LETSENCRIPT_FULLCHAIN),
};

const server = https.createServer(httpsOptions, app);

initWsServer(server);

server.listen(PORT, () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});
