const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanColumn_Controller = require("../../controller/devagile_controller/kanbanColumn_Controller.js");

const router = Router();
const kanbanColunm_controller = new KanbanColumn_Controller();

// Rota para criar um novo atendente e vincular a um setor
router.post("/api/helpdesk/column", checkTokenLogin, (req, res) =>
  kanbanColunm_controller.cadastraColumn_Controller(req, res)
);

module.exports = router;
