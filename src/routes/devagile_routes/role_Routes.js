const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const Role_Controller = require("../../controller/devagile_controller/Role_Controller.js");

const role_controller = new Role_Controller();
const route = Router();

route.post("/api/roles", checkTokenLogin, (req, res) =>
  role_controller.criaRole_Controller(req, res)
);

route.get("/api/roles", checkTokenLogin, (req, res) =>
  role_controller.pegaTodosRole_Controller(req, res)
);

route.get("/api/roles/:id", checkTokenLogin, (req, res) =>
  role_controller.pegaRolePorId_Controller(req, res)
);

route.delete("/api/roles/:id", checkTokenLogin, (req, res) =>
  role_controller.deletaRolePorId_Controller(req, res)
);

// rota para buscar permissões(telas) associadas a uma role(cargo)
route.get("/api/roles/:id/permissoes", checkTokenLogin, (req, res) =>
  role_controller.pegaPermissoesPorRole_Controller(req, res)
);

//route.put('/api/roles/:id',checkTokenLogin, )

module.exports = route;
