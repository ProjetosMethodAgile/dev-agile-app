const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const Kanban_Acao_Controller = require("../../controller/devagile_controller/Kanban_Acao_Controller.js");
const authorize = require("../../middlewares/authorize.js");

const kanban_acao_controller = new Kanban_Acao_Controller();
const route = Router();

route.post("/api/helpdesk/acoes/register", checkTokenLogin, (req, res) =>
  kanban_acao_controller.criaAcaoKanban_controller(req, res)
);

route.get(
  "/api/helpdesk/acoes",
  checkTokenLogin,
  // authorize(["Gerenciar Sistema"], { requiredAcao: "enviar email" }),
  (req, res) => kanban_acao_controller.pegaTodosKanban_Acao_Controller(req, res)
);

route.get("/api/helpdesk/acoes/column/:id", checkTokenLogin, (req, res) =>
  kanban_acao_controller.pegaAcoesPorColumnID_Controller(req, res)
);

route.get("/api/helpdesk/acoes/empresa/:id", checkTokenLogin, (req, res) =>
  kanban_acao_controller.pegaTodosAcaoPorEmpresa_Controller(req, res)
);

route.post("/api/helpdesk/acao/sendMail", checkTokenLogin, (req, res) =>
  kanban_acao_controller.sendEmailPorChangeColumn_Controller(req, res)
);

route.post("/api/helpdesk/acao/changeStatusCard", checkTokenLogin, (req, res) =>
  kanban_acao_controller.changeStatusCard_Controller(req, res)
);

module.exports = route;
