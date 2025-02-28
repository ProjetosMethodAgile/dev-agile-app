const { Router } = require("express");
const ParametrosController = require("../../controller/devagile_controller/Parametros_Controller");
const Empresa_Controller = require("../../controller/devagile_controller/Empresa_Controller");


const empresa_controller = new Empresa_Controller()
const route = Router();
const parametrosController = new ParametrosController();

route.get("/api/parametros", (req, res) =>
  parametrosController.pegaTodosParametros_controller(req, res)
);
route.get("/api/parametros/verifica/:id", (req, res) =>
  parametrosController.pegaParametrosEmpresa_controller(req, res)
);



route.post("/api/parametros", (req, res) =>
  parametrosController.criaParametros_controller(req, res)
);
route.delete("/api/parametros", (req, res) =>
  parametrosController.deletaParametrosporID_controller(req, res)
);
route.put("/api/parametros", (req, res) =>
  parametrosController.atualizaParametroPorNome(req, res)
);

module.exports = route;
