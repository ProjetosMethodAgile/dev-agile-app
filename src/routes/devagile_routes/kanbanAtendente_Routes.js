const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanAtendente_Controller = require("../../controller/devagile_controller/kanbanAtendente_Controller.js");

const router = Router();
const kanbanAtendenteController = new KanbanAtendente_Controller();

// Rota para criar um novo atendente e vincular a um setor
router.post("/api/helpdesk/atendentes", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.criaAtendente_Controller(req, res)
);

router.post("/api/helpdesk/atendente/card/:sessao_id", (req, res) =>
  kanbanAtendenteController.vinculaAtendenteToCard_Controller(req, res)
);

// Rota para consultar todos atendentes
router.get("/api/helpdesk/atendentes/all/:empresa_id", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.consultaTodosAtendente_Controller(req, res)
);
// Rota para consultar um atendente pelo ID
router.get("/api/helpdesk/atendentes/:id", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.consultaAtendente_Controller(req, res)
);

router.get(
  "/api/helpdesk/atendentes/empresa/:id",
  checkTokenLogin,
  (req, res) =>
    kanbanAtendenteController.consultaTodosAtendentesByEmpresaID_Controller(
      req,
      res
    )
);

router.get(
  "/api/helpdesk/atendentes/usuario/empresa/:id",
  checkTokenLogin,
  (req, res) =>
    kanbanAtendenteController.consultaUsuariosNaoAtendentesByEmpresaID_Controller(
      req,
      res
    )
);

// Rota para deletar um atendente pelo ID
router.delete("/api/helpdesk/atendentes/:id", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.deletaAtendente_Controller(req, res)
);
router.put("/api/helpdesk/atendentes/ativo/:id", checkTokenLogin, (req, res) =>
  kanbanAtendenteController.ativaAtendente_controller(req, res)
);

module.exports = router;
