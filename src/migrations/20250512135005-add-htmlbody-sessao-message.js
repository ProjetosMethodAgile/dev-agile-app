"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "kanban_sessoes_messages",
      "htmlBody", // nome da coluna (mesmo campo do payload)
      {
        type: Sequelize.TEXT, // suporta HTML completo
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "kanban_sessoes_messages", // tabela
      "htmlBody" // coluna a remover
    );
  },
};
