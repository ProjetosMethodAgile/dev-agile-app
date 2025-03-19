const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanSetores_Controller = require("../../controller/devagile_controller/kanbanSetores_Controller.js");

const router = Router();
const kanbanSetoresController = new KanbanSetores_Controller();

// Rota para buscar setores por empresa_id
router.get("/api/helpdesk/setores/empresa/:empresa_id", (req, res) =>
  kanbanSetoresController.buscaSetoresPorEmpresa_Controller(req, res)
);

//pega setores por usuario e empresa id
router.get("/api/helpdesk/atendente/:usr_id/empresa/:emp_id", (req, res) =>
  kanbanSetoresController.pegaSetorPorUsrAndEmp_Controller(req, res)
);

// Rota para cadastro de um novo setor
router.post("/api/helpdesk/setores", checkTokenLogin, (req, res) =>
  kanbanSetoresController.criaSetor_Controller(req, res)
);

// Rota para buscar um setor pelo ID
router.get("/api/helpdesk/setores/:id", checkTokenLogin, (req, res) =>
  kanbanSetoresController.pegaSetorPorId_Controller(req, res)
);

// Rota para atualizar um setor pelo ID
router.put("/api/helpdesk/setores/:id", checkTokenLogin, (req, res) =>
  kanbanSetoresController.atualizaSetorPorId_Controller(req, res)
);

// Rota para deletar um setor pelo ID
router.delete("/api/helpdesk/setores/:id", checkTokenLogin, (req, res) =>
  kanbanSetoresController.deletaSetorPorId_Controller(req, res)
);

module.exports = router;
