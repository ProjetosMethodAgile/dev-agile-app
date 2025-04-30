"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class KanbanStatusCard extends Model {
    static associate(models) {
      // cards que atualmente estão com este status
      KanbanStatusCard.hasMany(models.KanbanCards, {
        foreignKey: "status_card_id",
        as: "cards",
      });
      // histórico de trocas para este status
      KanbanStatusCard.hasMany(models.KanbanStatusHistory, {
        foreignKey: "status_card_id",
        as: "history",
      });
      // histórico de trocas cuja origem foi este status
      KanbanStatusCard.hasMany(models.KanbanStatusHistory, {
        foreignKey: "previous_status_card_id",
        as: "previousHistory",
      });
    }
  }

  KanbanStatusCard.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      descricao: DataTypes.TEXT,
      color: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanStatusCard",
      tableName: "kanban_status_card",
      underscored: true,
    }
  );

  return KanbanStatusCard;
};
