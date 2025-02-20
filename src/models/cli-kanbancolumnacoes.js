"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanColumnAcoes extends Model {
    static associate(models) {
      // Relacionamento com Usuario
      KanbanColumnAcoes.belongsTo(models.KanbanAcoes, {
        foreignKey: "usuario_id",
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
