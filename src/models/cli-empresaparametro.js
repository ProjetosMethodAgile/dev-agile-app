"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmpresaParametro extends Model {
    static associate(models) {
      // Relacionamento com Empresa
      EmpresaParametro.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "empresas",
      });

      // Relacionamento com Parametro
      EmpresaParametro.belongsTo(models.Parametro, {
        foreignKey: "parametro_id",
        as: "parametro",
      });
    }
  }

  EmpresaParametro.init(
    {
      empresa_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "empresas",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      parametro_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "parametros",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "EmpresaParametro",
      tableName: "empresa_parametros",
    }
  );

  return EmpresaParametro;
};
