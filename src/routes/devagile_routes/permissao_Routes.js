const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const Permissao_Controller = require("../../controller/devagile_controller/Permissao_Controller.js");
const authorize = require("../../middlewares/authorize.js");

const permissao_controller = new Permissao_Controller();

const route = Router();

route.post("/api/permissoes", checkTokenLogin, (req, res) =>
  permissao_controller.criaPermissao_Controller(req, res)
);

route.get("/api/permissoes", checkTokenLogin, (req, res) =>
  permissao_controller.pegaTodosPermissao_Controller(req, res)
);

route.get("/api/permissoes/:id", checkTokenLogin, (req, res) =>
  permissao_controller.pegaPermissaoPorId_Controller(req, res)
);

route.get("/api/permissoes/roles/:id", checkTokenLogin, (req, res) =>
  permissao_controller.pegaPermissoesPorRoleId(req, res)
);

route.delete("/api/permissoes/:id", checkTokenLogin, (req, res) =>
  permissao_controller.deletaPermissaoPorId_Controller(req, res)
);

//Retorna as permissões (telas) e as ações vinculadas ao usuário especificado
route.get("/api/permissoes/user/:id", checkTokenLogin, (req, res) =>
  permissao_controller.pegaPermissaoEacoesPorUserId_Controller(req, res)
);

// Atualizar permissão existente
route.put("/api/permissoes/:id", checkTokenLogin, (req, res) =>
  permissao_controller.atualizaPermissao_Controller(req, res)
);

module.exports = route;
