"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Parametros extends Model {
    static associate(models) {
      Parametros.belongsToMany(models.Empresa, {
        through: models.EmpresaParametro,
        as: "empresaParametros",
        foreignKey: "parametro_id",
      });
      Parametros.belongsTo(models.Permissao,{
        foreignKey:"tipo_id",
        as:"tela_parametros"
      })
    }
  }
  Parametros.init(
    {
      name: DataTypes.STRING,
      descricao: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "Parametros",
      tableName: "parametros",
    }
  );
  return Parametros;
};
