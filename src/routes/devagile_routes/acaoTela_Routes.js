const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const AcaoTela_Controller = require("../../controller/devagile_controller/AcaoTela_Controller.js");
const authorize = require("../../middlewares/authorize.js");

const acaoTela_controller = new AcaoTela_Controller();
const route = Router();

route.post("/api/acoes-tela", checkTokenLogin, (req, res) =>
  acaoTela_controller.criaAcaoTela_Controller(req, res)
);

route.get(
  "/api/acoes-tela",
  checkTokenLogin,
  // authorize(["Gerenciar Sistema"], { requiredAcao: "enviar email" }),
  (req, res) => acaoTela_controller.pegaTodosAcaoTela_Controller(req, res)
);

route.get("/api/acoes-tela/:id", checkTokenLogin, (req, res) =>
  acaoTela_controller.pegaAcaoTelaPorId_Controller(req, res)
);

route.delete("/api/acoes-tela/:id", checkTokenLogin, (req, res) =>
  acaoTela_controller.deletaAcaoTelaPorId_Controller(req, res)
);

module.exports = route;
