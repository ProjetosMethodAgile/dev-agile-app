const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanCards_Controller = require("../../controller/devagile_controller/kanbanCards_Controller.js");

const router = Router();
const kanbanCards_controller = new KanbanCards_Controller();

// Rota para buscar cards por setor id
router.get("/api/helpdesk/cardsBySetor/:id", checkTokenLogin, (req, res) =>
  kanbanCards_controller.pegaCardsPorSetorID(req, res)
);

router.get("/api/helpdesk/card/:card_id", (req, res) =>
  kanbanCards_controller.pegaCardPorID(req, res)
);

// Rota para cadastrar um novo card
router.post("/api/helpdesk/card", (req, res) =>
  kanbanCards_controller.cadastraCard_Controller(req, res)
);

// Rota para atualizar a column_id do card
router.put("/api/helpdesk/card/updateColumn", checkTokenLogin, (req, res) =>
  kanbanCards_controller.atualizaColumnCard_Controller(req, res)
);

module.exports = router;
