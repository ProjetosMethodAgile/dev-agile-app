const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const Kanban_Acao_Controller = require("../../controller/devagile_controller/Kanban_Acao_Controller.js");
const authorize = require("../../middlewares/authorize.js");

const kanabn_acao_controller = new Kanban_Acao_Controller();
const route = Router();

route.post("/api/acoes-tela", checkTokenLogin, (req, res) =>
  acaoTela_controller.criaAcaoTela_Controller(req, res)
);

route.get(
  "/api/helpdesk/acoes",
  checkTokenLogin,
  // authorize(["Gerenciar Sistema"], { requiredAcao: "enviar email" }),
  (req, res) => kanabn_acao_controller.pegaTodosKanban_Acao_Controller(req, res)
);
route.get(
  "/api/helpdesk/acoes/empresa/:id",
  checkTokenLogin,
  (req, res) => kanabn_acao_controller.pegaTodosAcaoPorEmpresa_Controller(req, res)
);


module.exports = route;
