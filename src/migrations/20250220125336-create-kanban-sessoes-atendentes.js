"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kanban_sessoes_atendentes", {
      id: {
        allowNull: false,

        primaryKey: true,
        type: Sequelize.UUID,
      },
      sessao_id: {
        type: Sequelize.UUID,
        references: { model: "kanban_sessoes", key: "id" },
      },
      atendente_id: {
        type: Sequelize.UUID,
        references: { model: "kanban_atendente_helpdesks", key: "id" },
      },
      visualizacao_atendente: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("kanban_sessoes_atendentes");
  },
};
