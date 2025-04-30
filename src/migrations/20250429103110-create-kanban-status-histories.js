"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("kanban_status_histories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "kanban_cards",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status_card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "kanban_status_card",
          key: "id",
        },
      },
      previous_status_card_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "kanban_status_card",
          key: "id",
        },
      },
      changed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "kanban_atendente_helpdesks",
          key: "id",
        },
      },
      empresa_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "empresas",
          key: "id",
        },
      },
      setor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "kanban_setores",
          key: "id",
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("kanban_status_histories");
  },
};
