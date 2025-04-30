"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("kanban_status_card", "color", {
      type: Sequelize.STRING(7),
      allowNull: true,
      comment: "Hex code da cor associada a este status, ex: #FF0000",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("kanban_status_card", "color");
  },
};
