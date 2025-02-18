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
    }
  }
  Parametros.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Parametros",
      tableName: "parametros",
    }
  );
  return Parametros;
};
