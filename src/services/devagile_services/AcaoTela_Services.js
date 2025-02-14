const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class AcaoTela_Services extends Services {
  constructor() {
    super("AcaoTela");
  }

  async criaAcaoTela_Services(dados) {
    // Verifica se já existe uma ação com o mesmo nome para a mesma tela (permissao_id)
    const acaoExistente = await devAgile[this.nomeModel].findOne({
      where: {
        nome: dados.nome,
        permissao_id: dados.permissao_id,
      },
    });

    if (acaoExistente !== null) {
      console.log("Já existe uma ação com o nome informado para esta tela");
      return { error: true, acao: acaoExistente };
    } else {
      const newAcao = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
        permissao_id: dados.permissao_id,
      });
      return { error: false, acao: newAcao };
    }
  }

  async pegaTodosAcaoTela_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  async pegaAcaoTelaPorId_Services(id) {
    return devAgile[this.nomeModel].findByPk(id);
  }

  async deletaAcaoTelaPorId_Services(id) {
    return devAgile[this.nomeModel].destroy({ where: { id } });
  }
}

module.exports = AcaoTela_Services;
