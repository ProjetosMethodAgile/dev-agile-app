const { Router } = require("express");

const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const Empresa_Controller = require("../../controller/devagile_controller/Empresa_Controller.js");

const empresa_controller = new Empresa_Controller();
const route = Router();

// Rota para criar uma nova empresa
route.post("/api/empresas", (req, res) =>
  empresa_controller.criaEmpresa_Controller(req, res)
);

// Rota para buscar todas as empresas
route.get("/api/empresas", checkTokenLogin, (req, res) =>
  empresa_controller.pegaTodasEmpresas_Controller(req, res)
);

// Rota para buscar uma empresa pelo ID
route.get("/api/empresas/:id", checkTokenLogin, (req, res) =>
  empresa_controller.pegaEmpresaPorId_Controller(req, res)
);

// Rota para buscar uma empresa pela TAG
route.get("/api/empresas/tag/:tag", (req, res) =>
  empresa_controller.pegaEmpresaPorTag_Controller(req, res)
);

// Rota para deletar uma empresa pelo ID
route.delete("/api/empresas/:id", checkTokenLogin, (req, res) =>
  empresa_controller.deletaEmpresaPorId_Controller(req, res)
);

// Rota para atualizar uma empresa pelo ID
route.put("/api/empresas/:id", checkTokenLogin, (req, res) =>
  empresa_controller.atualizaEmpresaPorId_Controller(req, res)
);

module.exports = route;
