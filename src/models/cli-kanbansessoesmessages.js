"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class KanbanSessoesMessages extends Model {
    static associate(models) {
      // Relacionamentos existentes
      KanbanSessoesMessages.belongsTo(models.KanbanSessoes, {
        foreignKey: "sessao_id",
        as: "SessaoMessage",
      });
      KanbanSessoesMessages.belongsTo(models.KanbanAtendenteHelpDesk, {
        foreignKey: "atendente_id",
        as: "AtendenteMessage",
      });
      KanbanSessoesMessages.belongsTo(models.Usuario, {
        foreignKey: "cliente_id",
        as: "ClienteSessao",
      });

      //Cada mensagem pode ter vários anexos
      KanbanSessoesMessages.hasMany(models.KanbanSessoesMessagesAttachments, {
        foreignKey: "message_id",
        as: "Attachments",
      });
    }
  }

  KanbanSessoesMessages.init(
    {
      sessao_id: DataTypes.UUID,
      atendente_id: DataTypes.UUID,
      cliente_id: DataTypes.UUID,
      content_msg: DataTypes.STRING,
      message_id: DataTypes.STRING,
      in_reply_to: DataTypes.STRING,
      references_email: DataTypes.TEXT,
      from_email: DataTypes.STRING,
      to_email: DataTypes.TEXT,
      cc_email: DataTypes.TEXT,
      bcc_email: DataTypes.TEXT,
      subject: DataTypes.TEXT,
      s3_eml_key: DataTypes.STRING,
      has_attachments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      system_msg: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "KanbanSessoesMessages",
      tableName: "kanban_sessoes_messages",
    }
  );

  return KanbanSessoesMessages;
};
