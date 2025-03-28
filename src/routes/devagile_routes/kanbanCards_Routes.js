const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanCards_Controller = require("../../controller/devagile_controller/kanbanCards_Controller.js");

const router = Router();
const kanbanCards_controller = new KanbanCards_Controller();

// Rota para buscar cards por setor id
router.get("/api/helpdesk/cardsBySetor/:id", checkTokenLogin, (req, res) =>
  kanbanCards_controller.pegaCardsPorSetorID(req, res)
);

// Rota para buscar um card específico
router.get("/api/helpdesk/card/:card_id", checkTokenLogin, (req, res) =>
  kanbanCards_controller.pegaCardPorID(req, res)
);

// Rota para cadastrar um novo card (para usuário não autenticado)
router.post("/api/helpdesk/card", (req, res) =>
  kanbanCards_controller.cadastraCard_Controller(req, res)
);

// Nova rota para responder a uma mensagem
router.post("/api/helpdesk/message/reply", checkTokenLogin, (req, res) =>
  kanbanCards_controller.replyMessage_Controller(req, res)
);

// Rota para cadastrar um novo card para usuário autenticado
router.post("/api/helpdesk/card/auth", checkTokenLogin, (req, res) =>
  kanbanCards_controller.cadastraCardAuth_Controller(req, res)
);

// Rota para atualizar a coluna do card
router.put("/api/helpdesk/card/updateColumn", checkTokenLogin, (req, res) =>
  kanbanCards_controller.atualizaColumnCard_Controller(req, res)
);

// Rota para atualizar os dados do email (consumida pela Lambda)
router.post("/api/helpdesk/email/update", (req, res) =>
  kanbanCards_controller.atualizaEmailData_Controller(req, res)
);

module.exports = router;
