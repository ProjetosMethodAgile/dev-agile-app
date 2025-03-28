"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionando cada coluna separadamente
    await queryInterface.addColumn("kanban_sessoes_messages", "message_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("kanban_sessoes_messages", "in_reply_to", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(
      "kanban_sessoes_messages",
      "references_email",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );

    await queryInterface.addColumn("kanban_sessoes_messages", "from_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("kanban_sessoes_messages", "to_email", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("kanban_sessoes_messages", "cc_email", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("kanban_sessoes_messages", "bcc_email", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("kanban_sessoes_messages", "subject", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("kanban_sessoes_messages", "s3_eml_key", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(
      "kanban_sessoes_messages",
      "has_attachments",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remover as colunas em caso de rollback
    await queryInterface.removeColumn("kanban_sessoes_messages", "message_id");
    await queryInterface.removeColumn("kanban_sessoes_messages", "in_reply_to");
    await queryInterface.removeColumn(
      "kanban_sessoes_messages",
      "references_email"
    );
    await queryInterface.removeColumn("kanban_sessoes_messages", "from_email");
    await queryInterface.removeColumn("kanban_sessoes_messages", "to_email");
    await queryInterface.removeColumn("kanban_sessoes_messages", "cc_email");
    await queryInterface.removeColumn("kanban_sessoes_messages", "bcc_email");
    await queryInterface.removeColumn("kanban_sessoes_messages", "subject");
    await queryInterface.removeColumn("kanban_sessoes_messages", "s3_eml_key");
    await queryInterface.removeColumn(
      "kanban_sessoes_messages",
      "has_attachments"
    );
  },
};
