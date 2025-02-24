"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona referência ao tipo de permissão (se necessário)
    await queryInterface.addColumn("permissoes", "tipo_permissao_id", {
      type: Sequelize.UUID,
      references: { model: "tipo_permissoes", key: "id" },
      allowNull: true,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Adiciona auto-relacionamento
    await queryInterface.addColumn("permissoes", "parent_id", {
      type: Sequelize.UUID,
      references: {
        model: "permissoes",
        key: "id",
      },
      allowNull: true, // Permissões raiz não precisam de pai
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("permissoes", "tipo_permissao_id");
    await queryInterface.removeColumn("permissoes", "parent_id");
  },
};
