const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class TipoPermissao_Services extends Services {
  constructor() {
    super("tipo_permissoes");
  }

  async criaTipoPermissao_Services(dados) {
    const tipoPermissao = await devAgile[this.nomeModel].findOne({
      where: {
        nome: dados.nome,
      },
    });

    if (tipoPermissao !== null) {
      console.log("Já existe um tipo de permissão com o nome informado");
      return { error: true, tipoPermissao: tipoPermissao };
    } else {
      const newTipoPermissao = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
      });
      return { error: false, tipoPermissao: newTipoPermissao };
    }
  }

  async pegaTodosTipoPermissao_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  async pegaTipoPermissaoPorId_Services(id) {
    return devAgile[this.nomeModel].findByPk(id);
  }

  async deletaTipoPermissaoPorId_Services(id) {
    return devAgile[this.nomeModel].destroy({ where: { id: id } });
  }
}

module.exports = TipoPermissao_Services;
