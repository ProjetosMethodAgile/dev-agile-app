const { json } = require("express");
const chatBot_router = require("./devagile_routes/chatBot_Routes");
const usuario_router = require("./devagile_routes/usuario_routes");
const role_router = require("./devagile_routes/role_Routes");
const permissao_router = require("./devagile_routes/permissao_Routes");
const empresas_router = require("./devagile_routes/empresas_Routes");
const acoesTela_router = require("./devagile_routes/acaoTela_Routes");
const cors = require("cors");

module.exports = (app) => {
  app.use(cors());
  app.use(json());
  app.use(chatBot_router);
  app.use(usuario_router);
  app.use(role_router);
  app.use(permissao_router);
  app.use(empresas_router);
  app.use(acoesTela_router);
};
