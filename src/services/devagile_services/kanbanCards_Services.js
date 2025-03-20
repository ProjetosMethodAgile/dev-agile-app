const { devAgile } = require("../../models");
const { Op } = require("sequelize");
const uuid = require("uuid");

class KanbanCards_Services {
  async cadastraCard_Services(column_id, src_img_capa, titulo_chamado, status) {
    try {
      // Cria o card com um novo UUID
      const card = await devAgile.KanbanCards.create({
        id: uuid.v4(),
        column_id,
        src_img_capa,
        titulo_chamado,
        status,
      });

      if (!card) {
        return {
          error: true,
          message: "Erro ao cadastrar card",
        };
      }
      return { card, error: false, message: "Cadastro realizado com sucesso" };
    } catch (error) {
      return {
        error: true,
        message: "Erro ao cadastrar card: " + error.message,
      };
    }
  }

  async pegaCardsPorSetorID_Services(setor_id) {
    try {
      // Busca todas as colunas associadas ao setor
      const columns = await devAgile.KanbanComlumns.findAll({
        where: { setor_id },
      });

      if (!columns || !columns.length) {
        return [];
      }

      // Extrai os IDs das colunas encontradas
      const columnIds = columns.map((column) => column.id);

      // Busca todos os cards cujos "column_id" estão presentes na lista de colunas
      const cards = await devAgile.KanbanCards.findAll({
        where: { column_id: { [Op.in]: columnIds } },
        include: [
          {
            model: devAgile.KanbanComlumns,
            as: "ColumnsCard",
          },
        ],
      });

      return cards;
    } catch (error) {
      throw new Error("Erro ao buscar cards: " + error.message);
    }
  }
}

module.exports = KanbanCards_Services;
