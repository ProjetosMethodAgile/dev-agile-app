"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("kanban_sessoes_messages", "system_msg", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("kanban_sessoes_messages", "system_msg");
  },
};
