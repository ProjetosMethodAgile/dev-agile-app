const { devAgile } = require("../../models");
const Services = require("../Services");
const uuid = require("uuid");

class KanbanColumn_Services extends Services {
  async validaPosicaoColumn_Services(posicao, setor_id) {
    const data = await devAgile.KanbanComlumns.findAll({
      where: { posicao: posicao, setor_id: setor_id },
    });

    if (data.length) {
      return { data, error: true };
    } else {
      return { data, error: false };
    }
  }

  async criaColumn_Services(nome, posicao, setor_id) {
    const column = await devAgile.KanbanComlumns.create({
      id: uuid.v4(),
      nome,
      posicao,
      setor_id,
    });

    if (!column) {
      return {
        column,
        error: true,
        message: "Erro ao cadastrar coluna",
        column,
      };
    }
    return { column, error: false, message: "cadastro realizado com sucesso" };
  }
}

module.exports = KanbanColumn_Services;
