const { json } = require("express");
const chatBot_router = require("./devagile_routes/chatBot_Routes");
const usuario_router = require("./devagile_routes/usuario_routes");
const role_router = require("./devagile_routes/role_Routes");
const permissao_router = require("./devagile_routes/permissao_Routes");
const empresas_router = require("./devagile_routes/empresas_Routes");
const acoesTela_router = require("./devagile_routes/acaoTela_Routes");
const parametros_route = require("./devagile_routes/parametros_Routes");
const tipos_permissoes_route = require("./devagile_routes/TipoPermissao_Routes");
const kanban_setores_route = require("./devagile_routes/kanbanSetores_Routes");
const kanban_motivos_route = require("./devagile_routes/KanbanMotivos_Routes");
const kanban_atendente_route = require("./devagile_routes/kanbanAtendente_Routes");
const kanban_column_route = require("./devagile_routes/kanbanColumns_Routes");
const kanban_acao_routes = require("./devagile_routes/kanban_acao_Routes");
const kanban_cards_route = require("./devagile_routes/kanbanCards_Routes");
const kanbanDashboard_routes = require("./devagile_routes/kanbanDashboard_routes");

const cors = require("cors");

module.exports = (app) => {
  app.use(cors());
  app.use(json());
  app.use(chatBot_router);
  app.use(usuario_router);
  app.use(role_router);
  app.use(permissao_router);
  app.use(empresas_router);
  app.use(acoesTela_router);
  app.use(parametros_route);
  app.use(tipos_permissoes_route);
  app.use(kanban_setores_route);
  app.use(kanban_motivos_route);
  app.use(kanban_atendente_route);
  app.use(kanban_column_route);
  app.use(kanban_acao_routes);
  app.use(kanban_cards_route);
  app.use(kanbanDashboard_routes);
};
