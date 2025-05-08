// src/controller/devagile_controller/KanbanDashboard_Controller.js

const Controller = require("../Controller.js");
const KanbanDashboard_Services = require("../../services/devagile_services/KanbanDashboard_Services.js");

class KanbanDashboard_Controller extends Controller {
  constructor() {
    super();
    this.services = new KanbanDashboard_Services();
  }

  // GET /api/dashboard/summary?setores=...&de=...&ate=...
  async getSummary_Controller(req, res) {
    try {
      const companyId = req.user.empresa.id;
      const userId = req.user.id;

      // parse optional override setores (comma-separated or array)
      let overrideSetores = [];
      if (req.query.setores) {
        overrideSetores = Array.isArray(req.query.setores)
          ? req.query.setores
          : req.query.setores.split(",");
      }

      // optional date range
      const dateFrom = req.query.de || null;
      const dateTo = req.query.ate || null;

      const summary = await this.services.getSummary_Services(
        companyId,
        userId,
        overrideSetores,
        dateFrom,
        dateTo
      );

      return res.status(200).json(summary);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao obter resumo do dashboard",
        error: e.message,
      });
    }
  }

  // GET /api/dashboard/charts?setores=...&de=...&ate=...
  async getCharts_Controller(req, res) {
    try {
      const companyId = req.user.empresa.id;
      const userId = req.user.id;

      let overrideSetores = [];
      if (req.query.setores) {
        overrideSetores = Array.isArray(req.query.setores)
          ? req.query.setores
          : req.query.setores.split(",");
      }
      const dateFrom = req.query.de || null;
      const dateTo = req.query.ate || null;

      const charts = await this.services.getCharts_Services(
        companyId,
        userId,
        overrideSetores,
        dateFrom,
        dateTo
      );
      return res.status(200).json(charts);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao obter dados para charts",
        error: e.message,
      });
    }
  }

  // GET /api/dashboard/movements?setores=...&de=...&ate=...
  async getMovements_Controller(req, res) {
    try {
      const companyId = req.user.empresa.id;
      const userId = req.user.id;

      let overrideSetores = [];
      if (req.query.setores) {
        overrideSetores = Array.isArray(req.query.setores)
          ? req.query.setores
          : req.query.setores.split(",");
      }
      const dateFrom = req.query.de || null;
      const dateTo = req.query.ate || null;

      const movements = await this.services.getMovements_Services(
        companyId,
        userId,
        overrideSetores,
        dateFrom,
        dateTo
      );
      return res.status(200).json(movements);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao obter movimentações",
        error: e.message,
      });
    }
  }
}

module.exports = KanbanDashboard_Controller;
