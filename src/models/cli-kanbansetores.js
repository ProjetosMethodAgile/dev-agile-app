"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KanbanSetores extends Model {
    static associate(models) {
      KanbanSetores.belongsTo(models.Empresa, {
        foreignKey: "empresa_id",
        as: "EmpresaSetorKanban",
      });

      KanbanSetores.hasMany(models.KanbanMotivos, {
        foreignKey: "setor_id",
        as: "MotivosSetores",
      });

      KanbanSetores.hasMany(models.KanbanComlumns, {
        foreignKey: "setor_id",
        as: "SetorColumns",
      });

      KanbanSetores.belongsToMany(models.KanbanAtendenteHelpDesk, {
        through: "kanban_atendente_setores",
        foreignKey: "setor_id",
        as: "Atendentes",
      });
    }
  }

  KanbanSetores.init(
    {
      empresa_id: DataTypes.UUID,
      nome: DataTypes.STRING,
      email_setor: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "KanbanSetores",
      tableName: "kanban_setores",
    }
  );
  return KanbanSetores;
};
