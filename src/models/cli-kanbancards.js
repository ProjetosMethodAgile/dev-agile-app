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

      KanbanCards.belongsTo(models.KanbanStatusCard, {
        foreignKey: "status_card_id",
        as: "status",
      });
      KanbanCards.hasMany(models.KanbanStatusHistory, {
        foreignKey: "card_id",
        as: "statusHistory",
      });
    }
  }

  KanbanCards.init(
    {
      column_id: DataTypes.UUID,
      src_img_capa: DataTypes.STRING,
      titulo_chamado: DataTypes.STRING,
      status_card_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "kanban_status_card", key: "id" },
      },
    },
    {
      sequelize,
      modelName: "KanbanCards",
      tableName: "kanban_cards",

      // GARANTE que usaremos camelCase nos timestamps:
      timestamps: true,
      underscored: false,
      // (opcional, pois são as chaves padrão)
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return KanbanCards;
};
