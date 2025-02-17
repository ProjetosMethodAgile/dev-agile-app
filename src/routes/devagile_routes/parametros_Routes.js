const { Router } = require("express");
const Parametros_Controller = require("../../controller/devagile_controller/Parametros_Controller");
const route = Router()
const parametros_Controller = new Parametros_Controller();

route.get("/api/parametros")


module.exports = route

