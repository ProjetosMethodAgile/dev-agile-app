"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanSessoes extends Model {
    static associate(models) {
      KanbanSessoes.belongsTo(models.KanbanCards, {
        foreignKey: "card_id",
        as: "SessaoCard",
      });

      KanbanSessoes.belongsToMany(models.KanbanAtendenteHelpDesk, {
        through: models.KanbanSessoesAtendentes,
        foreignKey: "sessao_id",
        as: "atendentesVinculados",
      });

      KanbanSessoes.hasMany(models.KanbanSessoesMessages, {
        foreignKey: "sessao_id",
        as: "MessageSessao",
      });
    }
  }
  KanbanSessoes.init(
    {
      card_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "KanbanSessoes",
      tableName: "kanban_sessoes",
    }
  );
  return KanbanSessoes;
};
