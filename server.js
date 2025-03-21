require("dotenv").config();

const app = require("./src/app.js");

const PORT = 3001;
const https = require("https");

const fs = require("fs");

const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/devagile.com.br/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/devagile.com.br/fullchain.pem"),
};

const server = https.createServer(httpsOptions, app);

server.listen(PORT, () => {
  console.log("servidor de aplicação ligado na porta " + PORT);
});
