"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class KanbanMotivos extends Model {
    static associate(models) {
      // setor a que pertence
      KanbanMotivos.belongsTo(models.KanbanSetores, {
        foreignKey: "setor_id",
        as: "SetoresMotivos",
      });
      // um motivo pode ter muitos cards
      KanbanMotivos.hasMany(models.KanbanCards, {
        foreignKey: "motivo_id",
        as: "Cards",
      });
    }
  }

  KanbanMotivos.init(
    {
      setor_id: { type: DataTypes.UUID, allowNull: false },
      descricao: { type: DataTypes.STRING, allowNull: false },
      src_img: { type: DataTypes.STRING, allowNull: true },
      sla_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 240,
        comment: "Prazo máximo em minutos para fechamento do chamado",
      },
    },
    {
      sequelize,
      modelName: "KanbanMotivos",
      tableName: "kanban_motivos",
    }
  );

  return KanbanMotivos;
};
