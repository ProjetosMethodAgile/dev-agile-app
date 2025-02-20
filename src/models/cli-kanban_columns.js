"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanComlumns extends Model {
    static associate(models) {
      KanbanComlumns.belongsTo(models.KanbanSetores, {
        foreignKey: "setor_id",
        as: "ColumnSetor",
      });

      KanbanComlumns.belongsToMany(models.KanbanAcoes, {
        through: models.KanbanColumnAcoes,
        foreignKey: "id_column",
        as: "ColumnAcoes",
      });

      KanbanComlumns.hasMany(models.KanbanCards, {
        foreignKey: "column_id",
        as: "CardsColumns",
      });
    }
  }
  KanbanComlumns.init(
    {
      setor_id: DataTypes.UUID,
      nome: DataTypes.STRING,
      posicao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanComlumns",
      tableName: "kanban_columns",
    }
  );
  return KanbanComlumns;
};
