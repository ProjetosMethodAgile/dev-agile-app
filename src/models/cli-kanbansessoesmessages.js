"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanSessoesMessages extends Model {
    static associate(models) {
      KanbanSessoesMessages.belongsTo(models.KanbanSessoes, {
        foreignKey: "sessao_id",
        as: "SessaoMessage",
      });
      KanbanSessoesMessages.belongsTo(models.KanbanAtendenteHelpDesk, {
        foreignKey: "atendente_id",
        as: "AtendenteMessage",
      });
      KanbanSessoesMessages.belongsTo(models.Usuario, {
        foreignKey: "cliente_id",
        as: "ClienteSessao",
      });
    }
  }

  KanbanSessoesMessages.init(
    {
      sessao_id: DataTypes.UUID,
      atendente_id: DataTypes.UUID,
      cliente_id: DataTypes.UUID,
      content_msg: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanSessoesMessages",
      tableName: "kanban_sessoes_messages",
    }
  );
  return KanbanSessoesMessages;
};
