"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // adiciona o nome da coluna anterior
    await queryInterface.addColumn(
      "kanban_status_histories",
      "previous_column",
      {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Nome da coluna de onde o card saiu",
      }
    );

    // adiciona o nome da coluna atual
    await queryInterface.addColumn("kanban_status_histories", "column_atual", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Nome da coluna para onde o card foi movido",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "kanban_status_histories",
      "column_atual"
    );
    await queryInterface.removeColumn(
      "kanban_status_histories",
      "previous_column"
    );
  },
};
