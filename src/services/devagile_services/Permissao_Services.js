const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class Permissao_Services extends Services {
  constructor() {
    super("Permissao");
  }

  async criaPermissao_Services(dados) {
    const newPermissao = await devAgile[this.nomeModel].create({
      id: uuid.v4(),
      nome: dados.nome,
      descricao: dados.descricao,
      parent_id: dados.parent_id || null, // Inclui parent_id se houver
      tipo_permissao_id: dados.tipo_permissao_id || null, // Inclui tipo_permissao_id se houver
    });

    return { error: false, permissao: newPermissao };
  }

  async pegaTodosPermissao_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  // NOVO: Busca permissões (telas) e ações vinculadas para um usuário específico
  async pegaPermissaoEacoesPorUserId_Services(userId) {
    return await devAgile.Permissao.findAll({
      include: [
        {
          model: devAgile.UserPermissionAccess,
          as: "user_permissions_access",
          where: { usuario_id: userId },
          required: false,
          attributes: ["can_create", "can_read", "can_update", "can_delete"],
        },
        {
          model: devAgile.AcaoTela,
          as: "acoes",
          include: [
            {
              model: devAgile.UserAcaoTela,
              as: "user_acoes",
              where: { usuario_id: userId },
              required: false,
            },
          ],
        },
      ],
    });
  }

  async pegaPermissaoPorId_Services(id) {
    return devAgile[this.nomeModel].findByPk(id);
  }

  async pegaPermissoesPorRoleId_Services(id) {
    try {
      const permissoes = await devAgile.RolePermissao.findAll({
        where: { role_id: id },
        include: [
          {
            model: devAgile.Permissao,
            as: "permissao",
            attributes: ["id", "nome", "descricao", "parent_id"],
          },
        ],
        attributes: [],
      });

      const resultado = permissoes.map((p) => p.permissao);
      return { status: true, permissoes: resultado };
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao buscar permissões");
    }
  }

  async atualizaPermissao_Services(id, dados) {
    const permissao = await devAgile[this.nomeModel].findByPk(id);
    if (!permissao) return null;

    await permissao.update(dados);
    return permissao;
  }

  async deletaPermissaoPorId_Services(id) {
    return devAgile[this.nomeModel].destroy({ where: { id: id } });
  }
}

module.exports = Permissao_Services;
