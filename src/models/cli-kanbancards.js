"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class KanbanCards extends Model {
    static associate(models) {
      // coluna kanban
      KanbanCards.belongsTo(models.KanbanComlumns, {
        foreignKey: "column_id",
        as: "ColumnsCard",
      });
      // anexos do card
      KanbanCards.hasMany(models.KanbanCardsAnexos, {
        foreignKey: "card_id",
        as: "AnexosCard",
      });
      // sessão do chat
      KanbanCards.hasOne(models.KanbanSessoes, {
        foreignKey: "card_id",
        as: "CardSessao",
      });
      // status atual
      KanbanCards.belongsTo(models.KanbanStatusCard, {
        foreignKey: "status_card_id",
        as: "status",
      });
      // histórico de mudanças
      KanbanCards.hasMany(models.KanbanStatusHistory, {
        foreignKey: "card_id",
        as: "statusHistory",
      });
      // vínculo com motivo
      KanbanCards.belongsTo(models.KanbanMotivos, {
        foreignKey: "motivo_id",
        as: "Motivo",
      });
    }
  }

  KanbanCards.init(
    {
      column_id: { type: DataTypes.UUID, allowNull: false },
      src_img_capa: { type: DataTypes.STRING, allowNull: true },
      titulo_chamado: { type: DataTypes.STRING, allowNull: false },
      status_card_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "kanban_status_card", key: "id" },
      },
      motivo_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "kanban_motivos", key: "id" },
        comment: "Motivo que define SLA deste card",
      },
    },
    {
      sequelize,
      modelName: "KanbanCards",
      tableName: "kanban_cards",
      timestamps: true,
      underscored: false,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return KanbanCards;
};
