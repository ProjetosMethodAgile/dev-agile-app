"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Associação com Role (Muitos para Muitos)
      Usuario.belongsToMany(models.Role, {
        through: models.usuarios_roles,
        as: "usuario_roles",
        foreignKey: "usuario_id",
      });

      // Associação com Permissao (Muitos para Muitos)
      Usuario.belongsToMany(models.Permissao, {
        through: models.UsuarioPermissao,
        as: "usuario_permissoes",
        foreignKey: "usuario_id",
      });

      // Associação com UserPermissionAccess (Um para Muitos)
      Usuario.hasMany(models.UserPermissionAccess, {
        foreignKey: "usuario_id",
        as: "user_permissions_access",
      });

      // Associação com Empresas (Muitos para Muitos)
      Usuario.belongsToMany(models.Empresa, {
        through: models.Usuario_Empresa,
        as: "empresas",
        foreignKey: "usuario_id",
      });

      // Associação com UserAcaoTela (Um para Muitos)
      Usuario.hasMany(models.UserAcaoTela, {
        foreignKey: "usuario_id",
        as: "user_acoes_tela",
      });

      Usuario.hasOne(models.KanbanAtendenteHelpDesk, {
        foreignKey: "usuario_id",
        as: "AtendenteUsuario",
      });

      Usuario.hasMany(models.KanbanSessoesMessages, {
        foreignKey: "cliente_id",
        as: "ClienteMessage",
      });

      
    }
  }

  Usuario.init(
    {
      nome: DataTypes.STRING,
      email: DataTypes.STRING,
      senha: DataTypes.STRING,
      contato: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "usuarios",
      defaultScope: {
        attributes: {
          exclude: ["senha"],
        },
      },
    }
  );

  return Usuario;
};
