const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class Role_Services extends Services {
  constructor() {
    super("Role");
  }

  async criaRole_Services(dados) {
    const role = await devAgile[this.nomeModel].findOne({
      where: {
        nome: dados.nome,
      },
    });

    if (role !== null) {
      console.log("já existe uma role com o nome informado");
      return { error: true, role: role };
    } else {
      const newRole = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
      });
      return { error: false, role: newRole };
    }
  }

  async pegaTodosRole_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  async pegaRolePorId_Services(id) {
    return devAgile[this.nomeModel].findByPk(id);
  }

  async deletaRolePorId_Services(id) {
    return devAgile[this.nomeModel].destroy({ where: { id: id } });
  }

  //serviço para pegar permissões associadas a uma role
  async pegaPermissoesPorRole_Services(roleId) {
    const role = await devAgile.Role.findByPk(roleId, {
      include: [
        {
          model: devAgile.Permissao, // Modelo de permissões
          as: "permissoes", // Alias definido na associação
        },
      ],
    });

    if (!role) {
      return null;
    }

    return role.permissoes; // Retorna as permissões associadas à role
  }
}

module.exports = Role_Services;
