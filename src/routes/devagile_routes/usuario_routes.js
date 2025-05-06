const { Router } = require("express");

const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const Usuario_Controller = require("../../controller/devagile_controller/Usuario_Controller.js");

const usuario_controller = new Usuario_Controller();
const route = Router();

route.put("/api/usuario/:id", checkTokenLogin, (req, res) =>
  usuario_controller.atualizaUsuario_Controller(req, res)
);

route.put("/api/usuario/reset-password/:id", checkTokenLogin, (req, res) =>
  usuario_controller.resetaSenhaUsuario_Controller(req, res)
);

route.get("/api/usuarios", checkTokenLogin, (req, res) =>
  usuario_controller.pegaTodosUsuarios_Controller(req, res)
);

route.get("/api/usuario/:id", checkTokenLogin, (req, res) =>
  usuario_controller.pegaUsuarioPorId_Controller(req, res)
);

route.get("/api/usuarios/empresa/:id", checkTokenLogin, (req, res) =>
  usuario_controller.pegaUsuariosPorEmpId_Controller(req, res)
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
