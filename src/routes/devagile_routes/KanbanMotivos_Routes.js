const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanMotivos_Controller = require("../../controller/devagile_controller/KanbanMotivos_Controller.js");

const router = Router();
const kanbanMotivosController = new KanbanMotivos_Controller();

// Rota para criar um novo motivo
router.post("/api/kanban/motivos", checkTokenLogin, (req, res) =>
  kanbanMotivosController.criaMotivo_Controller(req, res)
);

// Rota para listar todos os motivos
router.get("/api/kanban/motivos", (req, res) =>
  kanbanMotivosController.pegaTodosMotivos_Controller(req, res)
);

// Rota para buscar um motivo pelo ID
router.get("/api/kanban/motivos/:id", (req, res) =>
  kanbanMotivosController.pegaMotivoPorId_Controller(req, res)
);

// Rota para atualizar um motivo pelo ID
router.put("/api/kanban/motivos/:id", checkTokenLogin, (req, res) =>
  kanbanMotivosController.atualizaMotivoPorId_Controller(req, res)
);

// Rota para deletar um motivo pelo ID
router.delete("/api/kanban/motivos/:id", checkTokenLogin, (req, res) =>
  kanbanMotivosController.deletaMotivoPorId_Controller(req, res)
);

module.exports = router;
