const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class Permissao_Services extends Services {
  constructor() {
    super("Permissao");
  }

  async criaPermissao_Services(dados) {
    const permissaoExistente = await devAgile[this.nomeModel].findOne({
      where: {
        nome: dados.nome,
      },
    });

    if (permissaoExistente !== null) {
      console.log("Já existe uma permissão com o nome informado");
      return { error: true, permissao: permissaoExistente };
    } else {
      const newPermissao = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
      });
      return { error: false, permissao: newPermissao }; // Retorna o objeto correto
    }
  }

  async pegaTodosPermissao_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  async pegaPermissaoPorId_Services(id) {
    return devAgile[this.nomeModel].findByPk(id);
  }

  async deletaPermissaoPorId_Services(id) {
    return devAgile[this.nomeModel].destroy({ where: { id: id } });
  }
}

module.exports = Permissao_Services;
