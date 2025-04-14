"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanColumnAcoes extends Model {
    static associate(models) {
      // Relacionamento com Usuario
      KanbanColumnAcoes.belongsTo(models.KanbanAcoes, {
        foreignKey: "id_acao",
        as: "acoes_kanban",
      });

      // Relacionamento com Permissao
      KanbanColumnAcoes.belongsTo(models.KanbanComlumns, {
        foreignKey: "id_column",
        as: "columns_kanban",
      });
    }
  }
  KanbanColumnAcoes.init(
    {
      id:{
        type:DataTypes.UUID,
        primaryKey: true
      },
      id_column: DataTypes.UUID,
      id_acao: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "KanbanColumnAcoes",
      tableName: "kanban_column_acoes",
    }
  );
  return KanbanColumnAcoes;
};
