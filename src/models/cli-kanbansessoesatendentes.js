"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanSessoesAtendentes extends Model {
    static associate(models) {
      KanbanSessoesAtendentes.belongsTo(models.KanbanSessoes, {
        foreignKey: "sessao_id",
        as: "SessoesDeKanban",
      });
      KanbanSessoesAtendentes.belongsTo(models.KanbanAtendenteHelpDesk, {
        foreignKey: "atendente_id",
        as: "AtentendesDaSessao",
      });
    }
  }
  KanbanSessoesAtendentes.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
      },
      sessao_id: DataTypes.UUID,
      atendente_id: DataTypes.UUID,
      visualizacao_atendente: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "KanbanSessoesAtendentes",
      tableName: "kanban_sessoes_atendentes",
    }
  );
  return KanbanSessoesAtendentes;
};
