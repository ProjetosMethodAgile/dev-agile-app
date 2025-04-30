"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Adiciona status_card_id (nullable inicialmente)
    await queryInterface.addColumn("kanban_cards", "status_card_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "kanban_status_card",
        key: "id",
      },
    });

    // 3) Remove coluna antiga
    await queryInterface.removeColumn("kanban_cards", "status");

    // // 4) Torna NOT NULL
    // await queryInterface.changeColumn("kanban_cards", "status_card_id", {
    //   type: Sequelize.UUID,
    //   allowNull: false,
    //   references: {
    //     model: "kanban_status_card",
    //     key: "id",
    //   },
    // });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("kanban_cards", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Aberto",
    });
    await queryInterface.removeColumn("kanban_cards", "status_card_id");
  },
};
