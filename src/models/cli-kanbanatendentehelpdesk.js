"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanAtendenteHelpDesk extends Model {
    static associate(models) {
      KanbanAtendenteHelpDesk.belongsTo(models.Usuario, {
        foreignKey: "usuario_id",
        as: "UsuarioAtendente",
      });

      KanbanAtendenteHelpDesk.belongsToMany(models.KanbanSessoes, {
        through: models.KanbanSessoesAtendentes,
        foreignKey: "atendente_id",
        as: "AtendenteSessaoID",
      });

      KanbanAtendenteHelpDesk.hasOne(models.KanbanSessoesMessages, {
        foreignKey: "atendente_id",
        as: "MessageAtendente",
      });

      // No model KanbanAtendenteHelpDesk:
      KanbanAtendenteHelpDesk.belongsToMany(models.KanbanSetores, {
        through: "kanban_atendente_setores",
        foreignKey: "atendente_id",
        as: "Setores",
      });
    }
  }
  KanbanAtendenteHelpDesk.init(
    {
      usuario_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "KanbanAtendenteHelpDesk",
      tableName: "kanban_atendente_helpdesks",
    }
  );
  return KanbanAtendenteHelpDesk;
};
