"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanAcaoEmpresa extends Model {
    static associate(models) {
      KanbanAcaoEmpresa.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "Kanban_acao_por_empresa",
      });
      KanbanAcaoEmpresa.belongsTo(models.KanbanAcoes, {
        foreignKey: "kanban_acao_id",
        as: "kanban_empresa_por_acao",
      });
    }
  }

  KanbanAcaoEmpresa.init(
    {
      id:{
        type:DataTypes.UUID,
        primaryKey: true
      },
      empresa_id: DataTypes.UUID,
      kanban_acao_id: DataTypes.UUID
    },
    {
      sequelize,
      modelName: "KanbanAcaoEmpresa",
      tableName: "kanban_acao_empresa",
    }
  );

  return KanbanAcaoEmpresa;
};
