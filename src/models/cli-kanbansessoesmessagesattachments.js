"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class KanbanSessoesMessagesAttachments extends Model {
    static associate(models) {
      // Cada anexo pertence a uma mensagem
      KanbanSessoesMessagesAttachments.belongsTo(models.KanbanSessoesMessages, {
        foreignKey: "message_id",
        as: "Message",
      });
    }
  }

  KanbanSessoesMessagesAttachments.init(
    {
      message_id: DataTypes.UUID,
      s3_attachment_key: DataTypes.STRING,
      filename: DataTypes.STRING,
      mime_type: DataTypes.STRING,
      size: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "KanbanSessoesMessagesAttachments",
      tableName: "kanban_sessoes_messages_attachments",
    }
  );

  return KanbanSessoesMessagesAttachments;
};
