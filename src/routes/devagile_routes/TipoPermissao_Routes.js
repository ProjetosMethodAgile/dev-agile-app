const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const TipoPermissao_Controller = require("../../controller/devagile_controller/TipoPermissao_Controller.js");

const tipoPermissao_controller = new TipoPermissao_Controller();
const route = Router();

// Criar um novo tipo de permissão
route.post("/api/tipo-permissoes", checkTokenLogin, (req, res) =>
  tipoPermissao_controller.criaTipoPermissao_Controller(req, res)
);

// Listar todos os tipos de permissões
route.get("/api/tipo-permissoes", checkTokenLogin, (req, res) =>
  tipoPermissao_controller.pegaTodosTipoPermissao_Controller(req, res)
);

// Buscar um tipo de permissão por ID
route.get("/api/tipo-permissoes/:id", checkTokenLogin, (req, res) =>
  tipoPermissao_controller.pegaTipoPermissaoPorId_Controller(req, res)
);

// Deletar um tipo de permissão por ID
route.delete("/api/tipo-permissoes/:id", checkTokenLogin, (req, res) =>
  tipoPermissao_controller.deletaTipoPermissaoPorId_Controller(req, res)
);

module.exports = route;
