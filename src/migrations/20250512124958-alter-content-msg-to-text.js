"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "kanban_sessoes_messages",
      "content_msg",
      {
        type: Sequelize.TEXT, // ou Sequelize.TEXT('long') no MySQL
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "kanban_sessoes_messages",
      "content_msg",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },
};
