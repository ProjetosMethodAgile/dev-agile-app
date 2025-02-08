const { Router } = require("express");

const Usuario_Controller = require("../../controller/devagile_controller/usuario_Controller.js");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");

const usuario_controller = new Usuario_Controller();
const route = Router();

route.post("/api/usuario/register", (req, res) =>
  usuario_controller.registerUsuario_Controller(req, res)
);

module.exports = route;
