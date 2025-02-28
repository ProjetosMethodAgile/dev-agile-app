"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanAtendenteSetores extends Model {
    static associate(models) {
      // Associação para o atendente
      KanbanAtendenteSetores.belongsTo(models.KanbanAtendenteHelpDesk, {
        foreignKey: "atendente_id",
        as: "Atendente",
      });
      // Associação para o setor
      KanbanAtendenteSetores.belongsTo(models.KanbanSetores, {
        foreignKey: "setor_id",
        as: "Setor",
      });
    }
  }
  KanbanAtendenteSetores.init(
    {
      atendente_id: DataTypes.UUID,
      setor_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "KanbanAtendenteSetores",
      tableName: "kanban_atendente_setores",
    }
  );
  return KanbanAtendenteSetores;
};
