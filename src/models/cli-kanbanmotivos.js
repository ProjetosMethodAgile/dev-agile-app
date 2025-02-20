"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanMotivos extends Model {
    static associate(models) {
      KanbanMotivos.belongsTo(models.KanbanSetores, {
        foreignKey: "setor_id",
        as: "SetoresMotivos",
      });
    }
  }
  KanbanMotivos.init(
    {
      setor_id: DataTypes.UUID,
      descricao: DataTypes.STRING,
      src_img: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanMotivos",
      tableName: "kanban_motivos",
    }
  );
  return KanbanMotivos;
};
