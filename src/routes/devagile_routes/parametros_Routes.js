const { Router } = require("express");
const ParametrosController = require("../../controller/devagile_controller/Parametros_Controller");

const route = Router();
const parametrosController = new ParametrosController();

route.get("/api/parametros", (req, res) =>
  parametrosController.pegaTodosParametros_controller(req, res)
);
route.post("/api/parametros", (req, res) =>
  parametrosController.criaParametros_controller(req, res)
);

module.exports = route;
