const { devAgile, sequelizeDevAgileCli } = require("../../models");
const { Op } = require("sequelize");
const uuid = require("uuid");

class KanbanCards_Services {
  async cadastraCard_Services(
    column_id,
    src_img_capa,
    titulo_chamado,
    status,
    descricao
  ) {
    const transaction = await sequelizeDevAgileCli.transaction();

    try {
      // Cria o card na tabela kanban_cards
      const card = await devAgile.KanbanCards.create(
        {
          id: uuid.v4(),
          column_id,
          src_img_capa,
          titulo_chamado,
          status,
        },
        { transaction }
      );

      if (!card) {
        throw new Error("Erro ao cadastrar card");
      }

      // Cria a sessão para o card na tabela kanban_sessoes
      const sessao = await devAgile.KanbanSessoes.create(
        {
          id: uuid.v4(),
          card_id: card.id,
        },
        { transaction }
      );

      if (!sessao) {
        throw new Error("Erro ao cadastrar sessão do card");
      }

      // Cria a mensagem da sessão na tabela kanban_sessoes_messages
      const message = await devAgile.KanbanSessoesMessages.create(
        {
          id: uuid.v4(),
          sessao_id: sessao.id,
          content_msg: descricao,
          atendente_id: null, // não alimentado pelo cliente
          cliente_id: null, // não alimentado, pois é criado externamente
        },
        { transaction }
      );

      if (!message) {
        throw new Error("Erro ao cadastrar mensagem da sessão");
      }

      await transaction.commit();
      return { card, error: false, message: "Cadastro realizado com sucesso" };
    } catch (error) {
      await transaction.rollback();
      return {
        error: true,
        message: "Erro ao cadastrar card: " + error.message,
      };
    }
  }

  async atualizaColumnCard_Services(card_id, new_column_id) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // Verifica se o card existe
      const card = await devAgile.KanbanCards.findOne({
        where: { id: card_id },
      });
      if (!card) {
        throw new Error("Card não encontrado");
      }

      // (Opcional) Verifica se a nova coluna existe
      const column = await devAgile.KanbanComlumns.findOne({
        where: { id: new_column_id },
      });
      if (!column) {
        throw new Error("Coluna não encontrada");
      }

      // Atualiza o campo column_id do card
      await devAgile.KanbanCards.update(
        { column_id: new_column_id },
        { where: { id: card_id }, transaction }
      );

      await transaction.commit();
      return { error: false, message: "Coluna do card atualizada com sucesso" };
    } catch (error) {
      await transaction.rollback();
      return {
        error: true,
        message: "Erro ao atualizar coluna do card: " + error.message,
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
