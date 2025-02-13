"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Permissao extends Model {
    static associate(models) {
      // Relacionamento com Role (Muitos para Muitos)
      Permissao.belongsToMany(models.Role, {
        through: models.RolePermissao,
        as: "roles",
        foreignKey: "permissao_id",
      });

      // Relacionamento com Usuario (Muitos para Muitos)
      Permissao.belongsToMany(models.Usuario, {
        through: models.UsuarioPermissao,
        as: "usuarios",
        foreignKey: "permissao_id",
      });

      // Relacionamento com UserPermissionAccess (Um para Muitos)
      Permissao.hasMany(models.UserPermissionAccess, {
        foreignKey: "permissao_id",
        as: "user_permissions_access",
      });

      // Cada tela (permissao) pode ter várias ações (AcaoTela)
      Permissao.hasMany(models.AcaoTela, {
        foreignKey: "permissao_id",
        as: "acoes",
      });
    }
  }

  Permissao.init(
    {
      nome: DataTypes.STRING,
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Permissao",
      tableName: "permissoes",
    }
  );

  return Permissao;
};
