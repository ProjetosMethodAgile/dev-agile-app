"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("usuarios", "status", {
      type: Sequelize.STRING,
      defaultValue: "Ativo", // ou null, se quiser deixar sem valor padrão
      allowNull: true, // ou false, dependendo da sua regra
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("usuarios", "status");
  },
};
