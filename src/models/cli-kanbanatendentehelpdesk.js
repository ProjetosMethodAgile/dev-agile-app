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

      KanbanAtendenteHelpDesk.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "AtendentesEmpresa",
      });
    }
  }
  KanbanAtendenteHelpDesk.init(
    {
      id:{
        type:
        DataTypes.UUID,
        primaryKey:true
      },
      usuario_id: DataTypes.UUID,
      empresa_id: DataTypes.UUID,
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "KanbanAtendenteHelpDesk",
      tableName: "kanban_atendente_helpdesks",
    }
  );
  return KanbanAtendenteHelpDesk;
};
