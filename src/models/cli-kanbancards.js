"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanCards extends Model {
    static associate(models) {
      KanbanCards.belongsTo(models.KanbanComlumns, {
        foreignKey: "column_id",
        as: "ColumnsCard",
      });

      KanbanCards.hasMany(models.KanbanCardsAnexos, {
        foreignKey: "card_id",
        as: "AnexosCard",
      });
      KanbanCards.hasOne(models.KanbanSessoes, {
        foreignKey: "card_id",
        as: "CardSessao",
      });
    }
  }
  KanbanCards.init(
    {
      column_id: DataTypes.UUID,
      src_img_capa: DataTypes.STRING,
      titulo_chamado: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanCards",
      tableName: "kanban_cards",
    }
  );
  return KanbanCards;
};
