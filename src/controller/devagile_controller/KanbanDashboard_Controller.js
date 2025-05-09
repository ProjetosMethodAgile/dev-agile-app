// src/controller/devagile_controller/KanbanDashboard_Controller.js
const Controller = require("../Controller.js");
const KanbanDashboard_Services = require("../../services/devagile_services/KanbanDashboard_Services.js");

class KanbanDashboard_Controller extends Controller {
  constructor() {
    super();
    this.services = new KanbanDashboard_Services();
  }

  // GET /api/dashboard/summary
  async getSummary_Controller(req, res) {
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

  // GET /api/dashboard/charts
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

  // GET /api/dashboard/movements
  async getMovements_Controller(req, res) {
    try {
      const companyId = req.user.empresa.id;
      const userId = req.user.id;

      // override setores
      const overrideSetores = Array.isArray(req.query.setores)
        ? req.query.setores
        : req.query.setores
        ? req.query.setores.split(",")
        : [];

      const dateFrom = req.query.de || null;
      const dateTo = req.query.ate || null;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 5;
      const search = req.query.search || "";

      const result = await this.services.getMovements_Services(
        companyId,
        userId,
        overrideSetores,
        dateFrom,
        dateTo,
        { page, pageSize, search }
      );
      // result: { total, page, pageSize, movements: [] }
      return res.status(200).json(result);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao obter movimentações",
        error: e.message,
      });
    }
  }

  // GET /api/dashboard/created?date=YYYY-MM-DD
  async getCreatedByDate_Controller(req, res) {
    try {
      const companyId = req.user.empresa.id;
      const userId = req.user.id;
      let overrideSetores = [];
      if (req.query.setores) {
        overrideSetores = Array.isArray(req.query.setores)
          ? req.query.setores
          : req.query.setores.split(",");
      }
      // nesse endpoint usamos apenas date (igual de e ate)
      const date = req.query.date;
      const created = await this.services.getCreatedByDate_Services(
        companyId,
        userId,
        overrideSetores,
        date,
        date
      );
      return res.status(200).json(created);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao obter chamados criados por data",
        error: e.message,
      });
    }
  }

  // GET /api/dashboard/calendar?de=YYYY-MM&ate=YYYY-MM
  async getCalendar_Controller(req, res) {
    try {
      const companyId = req.user.empresa.id;
      const userId = req.user.id;
      let overrideSetores = [];
      if (req.query.setores) {
        overrideSetores = Array.isArray(req.query.setores)
          ? req.query.setores
          : req.query.setores.split(",");
      }
      const dateFrom = req.query.de || null; // format YYYY-MM
      const dateTo = req.query.ate || dateFrom;
      const calendar = await this.services.getCalendar_Services(
        companyId,
        userId,
        overrideSetores,
        dateFrom,
        dateTo
      );
      return res.status(200).json(calendar);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao obter heatmap do calendário",
        error: e.message,
      });
    }
  }
}

module.exports = KanbanDashboard_Controller;
