"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAcaoTela extends Model {
    static associate(models) {
      // Associação com o usuário
      UserAcaoTela.belongsTo(models.Usuario, {
        foreignKey: "usuario_id",
        as: "usuario",
      });
      // Associação com a ação da tela
      UserAcaoTela.belongsTo(models.AcaoTela, {
        foreignKey: "acao_tela_id",
        as: "acao_tela",
      });
    }
  }

  UserAcaoTela.init(
    {},
    {
      sequelize,
      modelName: "UserAcaoTela", // Esse nome deve ser exatamente "UserAcaoTela"
      tableName: "user_acao_tela",
    }
  );

  return UserAcaoTela;
};
