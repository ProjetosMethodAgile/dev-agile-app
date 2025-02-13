"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AcaoTela extends Model {
    static associate(models) {
      // Cada ação pertence a uma tela (representada por Permissao)
      AcaoTela.belongsTo(models.Permissao, {
        foreignKey: "permissao_id",
        as: "tela",
      });
      // Uma ação pode ter vários registros de acesso do usuário
      // Certifique-se de que models.UserAcaoTela existe e foi carregado
      AcaoTela.hasMany(models.UserAcaoTela, {
        foreignKey: "acao_tela_id",
        as: "user_acoes",
      });
    }
  }

  AcaoTela.init(
    {
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "AcaoTela", // Nome consistente com o que você usa na associação
      tableName: "acao_tela",
    }
  );

  return AcaoTela;
};
