const { Router } = require("express");

const Usuario_Controller = require("../../controller/devagile_controller/usuario_Controller.js");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");

const usuario_controller = new Usuario_Controller();
const route = Router();

route.put("/api/usuario/:id", checkTokenLogin, (req, res) =>
  usuario_controller.atualizaUsuario_Controller(req, res)
);

route.get("/api/usuarios", checkTokenLogin, (req, res) =>
  usuario_controller.pegaTodosUsuarios_Controller(req, res)
);

route.get("/api/usuario/:id", checkTokenLogin, (req, res) =>
  usuario_controller.pegaUsuarioPorId_Controller(req, res)
);

route.post("/api/usuario/login", (req, res) => {
  usuario_controller.loginUsuario_Controller(req, res);
});

route.post("/api/usuario/register", checkTokenLogin, (req, res) =>
  usuario_controller.registerUsuario_Controller(req, res)
);

route.delete("/api/usuario/:id", checkTokenLogin, (req, res) => {
  usuario_controller.deletaUsuarioPorId_Controller(req, res);
});

module.exports = route;
