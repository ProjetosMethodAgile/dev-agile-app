const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanAtendente_Controller = require("../../controller/devagile_controller/kanbanAtendente_Controller.js");

const router = Router();
const kanbanAtendenteController = new KanbanAtendente_Controller();

// Rota para criar um novo atendente e vincular a um setor
router.post("/api/helpdesk/atendentes", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.criaAtendente_Controller(req, res)
);

// Rota para consultar um atendente pelo ID
router.get("/api/helpdesk/atendentes/:id", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.consultaAtendente_Controller(req, res)
);

// Rota para deletar um atendente pelo ID
router.delete("/api/helpdesk/atendentes/:id", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.deletaAtendente_Controller(req, res)
);

module.exports = router;
