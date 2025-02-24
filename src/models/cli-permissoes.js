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

      // Relacionamento com parâmetros
      Permissao.hasMany(models.Parametros, {
        foreignKey: "tipo_id",
        as: "parametros_tela",
      });

      // Relacionamento com tipo_permissoes (Cada permissão tem um tipo)
      Permissao.belongsTo(models.tipo_permissoes, {
        foreignKey: "tipo_permissao_id",
        as: "tipoPermissao",
      });

      Permissao.belongsTo(models.Permissao, {
        foreignKey: "parent_id",
        as: "parent", // Nome usado para buscar a permissão pai
      });

      Permissao.hasMany(models.Permissao, {
        foreignKey: "parent_id",
        as: "subpermissoes", // Nome usado para buscar as subpermissões
      });
    }
  }

  Permissao.init(
    {
      nome: DataTypes.STRING,
      descricao: DataTypes.STRING,
      tipo_permissao_id: DataTypes.UUID,
      parent_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Permissao",
      tableName: "permissoes",
    }
  );

  return Permissao;
};
