"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("usuarios", "primeiro_acesso", {
      type: Sequelize.BOOLEAN,
      defaultValue: true, 
      allowNull: false, // ou false, dependendo da sua regra
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("usuarios", "primeiro_acesso");
  },
};
