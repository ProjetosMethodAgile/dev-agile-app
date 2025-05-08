"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) adiciona sla_minutes em kanban_motivos
    await queryInterface.addColumn("kanban_motivos", "sla_minutes", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 240, // prazo padrão de 240 minutos (4 horas)
      comment: "Prazo máximo em minutos para fechamento do chamado",
    });

    // 2) adiciona motivo_id em kanban_cards
    await queryInterface.addColumn("kanban_cards", "motivo_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "kanban_motivos",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Vincula o card ao motivo que define seu SLA",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // desfaz na ordem inversa
    await queryInterface.removeColumn("kanban_cards", "motivo_id");
    await queryInterface.removeColumn("kanban_motivos", "sla_minutes");
  },
};
