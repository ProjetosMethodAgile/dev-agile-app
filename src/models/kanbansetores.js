"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanSetores extends Model {
    static associate(models) {
      KanbanSetores.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "EmpresaSetorKanban",
      });
    }
  }
  KanbanSetores.init(
    {
      empresa_id: DataTypes.UUID,
      nome: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanSetores",
    }
  );
  return KanbanSetores;
};
