"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kanban_atendente_setores", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      atendente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "kanban_atendente_helpdesks", // nome da tabela de atendentes
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      setor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "kanban_setores", // nome da tabela de setores
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("kanban_atendente_setores");
  },
};
