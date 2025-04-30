"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) adiciona coluna usuario_id
    await queryInterface.addColumn("kanban_status_histories", "usuario_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
      onDelete: "SET NULL",
      comment: "Usuário que gerou a ação (cliente)",
    });

    // 2) adiciona coluna action_type
    await queryInterface.addColumn("kanban_status_histories", "action_type", {
      type: Sequelize.ENUM(
        "create_card",
        "column_move",
        "status_change",
        "message_client",
        "message_attendant",
        "vinculo_atendente"
      ),
      allowNull: false,
      defaultValue: "status_change",
      comment: "Tipo de movimentação no ticket",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("kanban_status_histories", "action_type");
    await queryInterface.removeColumn("kanban_status_histories", "usuario_id");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_kanban_status_histories_action_type";'
    );
  },
};
