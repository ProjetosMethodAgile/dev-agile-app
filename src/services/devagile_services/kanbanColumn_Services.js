const { devAgile } = require("../../models/index.js");
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

  async cadastraColumn_Service(nome, posicao, setor_id, id_acao) {
    try {
      const column = await devAgile.KanbanComlumns.create({
        id: uuid.v4(),
        nome,
        posicao,
        setor_id,
      });

      const columnNow = await devAgile.KanbanColumnAcoes.create({
        id: uuid.v4(),
        id_column: column.dataValues.id,
        id_acao: id_acao,
      });

      return { error: false, message: "Cadastro realizado com sucesso" };
    } catch (err) {
      return {
        error: true,
        message: "Erro ao cadastrar coluna: " + err.message,
      };
    }
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

  async pegaPosicaoColumn_Services(setor_id) {
    const posicao = await devAgile.KanbanComlumns.findAll({
      attributes: ["posicao"],
      where: { setor_id },
    });

    const posicoesKanban = posicao.map((item)=> item.posicao

  )
    return posicoesKanban;
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

  async pegaTodasColumnsPorSetorEEmpresaID_Services(setor_id, emp_id) {
    try {
      const empresa = await devAgile.Empresa.findOne({ where: { id: emp_id } });
      const columnsList = await devAgile.KanbanComlumns.findAll({
        where: { setor_id: setor_id },
        include: [
          {
            model: devAgile.KanbanAcoes,
            as: "ColumnAcoes",
            through: { attributes: [] },
          },
        ],
      });

      if (!empresa || !columnsList.length) {
        return {
          ok: false,
          message:
            "erro ao consultar dados, contate o administrador do sistema",
        };
      }
      return { ok: true, columnsList };
    } catch (error) {
      return {
        ok: false,
        message: "erro ao consultar dados, contate o administrador do sistema",
      };
    }
  }
}

module.exports = KanbanColumn_Services;
