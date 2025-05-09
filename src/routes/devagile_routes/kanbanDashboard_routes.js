// routes/devagile/dashboard.js

const { Router } = require("express");
const checkTokenLogin = require("../../middlewares/checkTokenLogin.js");
const KanbanDashboard_Controller = require("../../controller/devagile_controller/KanbanDashboard_Controller.js");

const dashboard_controller = new KanbanDashboard_Controller();
const route = Router();

// resumo geral do dashboard
// aceita opcionalmente ?setores[]=id1&setores[]=id2
route.get("/api/dashboard/summary", checkTokenLogin, (req, res) =>
  dashboard_controller.getSummary_Controller(req, res)
);

// dados para os gráficos
// aceita opcionalmente ?setores[]=id1&setores[]=id2

route.get("/api/dashboard/charts", checkTokenLogin, (req, res) =>
  dashboard_controller.getCharts_Controller(req, res)
);

// últimas movimentações
// aceita opcionalmente ?setores[]=id1&setores[]=id2

route.get("/api/dashboard/movements", checkTokenLogin, (req, res) =>
  dashboard_controller.getMovements_Controller(req, res)
);

// chamados criados em um dia (query: ?date=YYYY-MM-DD)
route.get("/api/dashboard/created", checkTokenLogin, (req, res) =>
  dashboard_controller.getCreatedByDate_Controller(req, res)
);

route.get("/api/dashboard/calendar", checkTokenLogin, (req, res) =>
  dashboard_controller.getCalendar_Controller(req, res)
);
module.exports = route;
