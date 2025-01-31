"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usuarios", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      nome: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      senha: {
        type: Sequelize.STRING,
      },
      contato: {
        type: Sequelize.STRING,
      },
      role_id: {
        type: Sequelize.UUID,
        references: {
          model: "roles",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
    await queryInterface.dropTable("usuarios");
  },
};
