"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("kanban_atendente_helpdesks", "empresa_id", {
      type: Sequelize.UUID,
      references: { model: "empresas", key: "id" },
      allowNull: false,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "kanban_atendente_helpdesks",
      "empresa_id"
    );
  },
};
