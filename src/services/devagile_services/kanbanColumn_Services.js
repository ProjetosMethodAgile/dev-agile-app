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

  async atualizaOrdemColumnsPorSetorID_Services(setor_id, setor_list) {
    try {
      // setor_list deve ser um array de objetos com os atributos: { id, posicao }
      const updatePromises = setor_list.map((column) => {
        return devAgile.KanbanComlumns.update(
          { posicao: column.posicao },
          { where: { id: column.id, setor_id } }
        );
      });
      await Promise.all(updatePromises);
      return {
        message: "Ordem das colunas atualizada com sucesso",
        error: false,
      };
    } catch (error) {
      return {
        message: "erro ao atualizar, contate o administrador do sistema",
        error: true,
      };
    }
  }
}

module.exports = KanbanColumn_Services;
