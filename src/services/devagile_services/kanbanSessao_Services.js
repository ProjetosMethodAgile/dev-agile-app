const { devAgile, sequelizeDevAgileCli } = require("../../models/index.js");
const { Op, where } = require("sequelize");
const uuid = require("uuid");
const ws = require("../../websocket.js");

class KanbanSessao_Services {
  async pegaSessaoCardPorId_Services(id) {
    return await devAgile.KanbanSessoes.findOne({
      where: { id },
    });
  }
  async validaSessaoPorAtendenteId_Services(atendente_id, sessao_id) {
    return await devAgile.KanbanSessoesAtendentes.findOne({
      where: { atendente_id, sessao_id },
    });
  }
}

module.exports = KanbanSessao_Services;
