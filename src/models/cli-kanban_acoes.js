"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanAcoes extends Model {
    static associate(models) {
      KanbanAcoes.belongsToMany(models.KanbanComlumns, {
        through: models.KanbanColumnAcoes,
        foreignKey: "id_acao",
        as: "AcoesColumn",
      });
      
      KanbanAcoes.belongsToMany(models.Empresa, {
        through: models.KanbanAcaoEmpresa,
        foreignKey: "empresa_id",
        as: "kanbanAcaoEmpresas",
      });
    }
  }
  KanbanAcoes.init(
    {
      nome: DataTypes.STRING,
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanAcoes",
      tableName: "kanban_acoes",
    }
  );
  return KanbanAcoes;
};
