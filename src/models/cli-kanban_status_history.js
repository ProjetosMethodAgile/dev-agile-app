"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class KanbanStatusHistory extends Model {
    static associate(models) {
      // Card que sofreu a mudança
      KanbanStatusHistory.belongsTo(models.KanbanCards, {
        foreignKey: "card_id",
        as: "card",
      });
      // Novo status aplicado
      KanbanStatusHistory.belongsTo(models.KanbanStatusCard, {
        foreignKey: "status_card_id",
        as: "status",
      });
      // Status anterior
      KanbanStatusHistory.belongsTo(models.KanbanStatusCard, {
        foreignKey: "previous_status_card_id",
        as: "previousStatus",
      });
      // Atendente que executou a ação
      KanbanStatusHistory.belongsTo(models.KanbanAtendenteHelpDesk, {
        foreignKey: "changed_by",
        as: "atendente",
      });
      // Usuário-cliente que interagiu
      KanbanStatusHistory.belongsTo(models.Usuario, {
        foreignKey: "usuario_id",
        as: "usuario",
      });
      // Empresa do chamado
      KanbanStatusHistory.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "empresa",
      });
      // Setor do chamado
      KanbanStatusHistory.belongsTo(models.KanbanSetores, {
        foreignKey: "setor_id",
        as: "setor",
      });
    }
  }

  KanbanStatusHistory.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status_card_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      previous_status_card_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      changed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      usuario_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      empresa_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      setor_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      // Novos campos para armazenar nome das colunas
      previous_column: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      column_atual: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action_type: {
        type: DataTypes.ENUM(
          "column_move",
          "status_change",
          "message_client",
          "message_attendant",
          "message_system",
          "vinculo_atendente",
          "create_card"
        ),
        allowNull: false,
        defaultValue: "status_change",
      },
    },
    {
      sequelize,
      modelName: "KanbanStatusHistory",
      tableName: "kanban_status_histories",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return KanbanStatusHistory;
};
