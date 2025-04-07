"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Empresa extends Model {
    static associate(models) {
      // Relacionamento com Usuario (Muitos para Muitos)
      Empresa.belongsToMany(models.Usuario, {
        through: models.Usuario_Empresa,
        as: "usuarios",
        foreignKey: "empresa_id",
      });

      Empresa.belongsToMany(models.Parametros, {
        through: models.EmpresaParametro,
        as: "parametrosEmpresa",
        foreignKey: "empresa_id",
      });
      Empresa.belongsToMany(models.Parametros, {
        through: models.EmpresaParametro, 
        as: "parametros",                
        foreignKey: "empresa_id"         
      });
      Empresa.hasMany(models.KanbanSetores, {
        foreignKey: "empresa_id",
        as: "SetorEmpresaKanban",
      });

      Empresa.belongsToMany(models.KanbanAcoes, {
        through: models.KanbanAcaoEmpresa,
        foreignKey: "kanban_acao_id",
        as: "kanbanEmpresaAcao",
      });
    }
  }

  Empresa.init(
    {
      nome: DataTypes.STRING,
      descricao: DataTypes.STRING,
      endereco: DataTypes.STRING,
      cnpj: DataTypes.STRING,
      tag: DataTypes.STRING,
      logo: DataTypes.STRING,
      cor_primaria: DataTypes.STRING,
      cor_secundaria: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Empresa",
      tableName: "empresas",
    }
  );

  return Empresa;
};
