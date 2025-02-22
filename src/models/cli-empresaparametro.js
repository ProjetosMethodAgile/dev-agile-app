"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmpresaParametro extends Model {
    static associate(models) {
      EmpresaParametro.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "empresas",
      });

      // Relacionamento com Parametro
      EmpresaParametro.belongsTo(models.Parametros, {
        foreignKey: "parametro_id",
        as: "parametro",
      });
    }
  }


  EmpresaParametro.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      empresa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "empresas",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      parametro_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      tableName: "EmpresaParametros",
    }
  );

  return EmpresaParametro;
};
