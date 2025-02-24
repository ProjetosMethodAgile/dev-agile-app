"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tipo_permissoes extends Model {
    static associate(models) {
      tipo_permissoes.hasOne(models.Permissao, {
        foreignKey: "tipo_permissao_id",
        as: "PermissaoTipo",
      });
    }
  }
  tipo_permissoes.init(
    {
      nome: DataTypes.STRING,
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tipo_permissoes",
      tableName: "tipo_permissoes",
    }
  );
  return tipo_permissoes;
};
