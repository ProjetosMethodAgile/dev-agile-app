"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("empresas", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING,
      },
      endereco: {
        type: Sequelize.STRING,
      },
      cnpj: {
        type: Sequelize.STRING,
        unique: true,
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // opcional, mas recomendado para identificar a empresa na URL
      },
      logo: {
        type: Sequelize.STRING,
      },
      cor_primaria: {
        type: Sequelize.STRING,
      },
      cor_secundaria: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("empresas");
  },
};
