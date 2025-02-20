"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanCardsAnexos extends Model {
    static associate(models) {
      KanbanCardsAnexos.belongsTo(models.KanbanCards, {
        foreignKey: "card_id",
        as: "CardsAnexo",
      });
    }
  }
  KanbanCardsAnexos.init(
    {
      card_id: DataTypes.UUID,
      src_anexo: DataTypes.STRING,
      tipo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanCardsAnexos",
      tableName: "kanban_cards_anexos",
    }
  );
  return KanbanCardsAnexos;
};
