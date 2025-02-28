const { devAgile } = require("../../models");
const Services = require("../Services");
const uuid = require("uuid");

class KanbanColumn_Services extends Services {
  async validaPosicaoColumn_Services(posicao, setor_id) {
    const data = await devAgile.KanbanComlumns.findAll({
      where: { posicao, setor_id },
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
        error: true,
        message: "Erro ao cadastrar coluna",
      };
    }
    return { column, error: false, message: "Cadastro realizado com sucesso" };
  }

  async validaSetorID_Service(setor_id) {
    try {
      let columns = [];
      if (setor_id) {
        columns = await devAgile.KanbanComlumns.findAll({
          where: { setor_id },
        });
      }
      return columns;
    } catch (error) {
      throw new Error(`Erro ao buscar setor: ${error.message}`);
    }
  }
}

module.exports = KanbanColumn_Services;
