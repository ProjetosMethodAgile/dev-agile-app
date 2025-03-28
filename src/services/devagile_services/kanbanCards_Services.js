const { devAgile, sequelizeDevAgileCli } = require("../../models");
const { Op } = require("sequelize");
const uuid = require("uuid");
const ws = require("../../websocket.js"); // Importa o websocket

class KanbanCards_Services {
  async cadastraCard_Services(
    column_id,
    src_img_capa,
    titulo_chamado,
    status,
    descricao,
    setor_id
  ) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // Cria o card
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
      if (!card) throw new Error("Erro ao cadastrar card");

      // Cria a sessão para o card
      const sessao = await devAgile.KanbanSessoes.create(
        {
          id: uuid.v4(),
          card_id: card.id,
        },
        { transaction }
      );
      if (!sessao) throw new Error("Erro ao cadastrar sessão do card");

      // Cria a mensagem da sessão
      const message = await devAgile.KanbanSessoesMessages.create(
        {
          id: uuid.v4(),
          sessao_id: sessao.id,
          content_msg: descricao,
          atendente_id: null,
          cliente_id: null,
          message_id: null,
        },
        { transaction }
      );
      if (!message) throw new Error("Erro ao cadastrar mensagem da sessão");

      await transaction.commit();
      console.log(`cardCreated-${setor_id}`);
      ws.broadcast({ type: `cardCreated-${setor_id}`, card });
      return {
        card,
        error: false,
        message: "Cadastro realizado com sucesso",
        createdMessage: message,
      };
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
      const card = await devAgile.KanbanCards.findOne({
        where: { id: card_id },
      });
      if (!card) throw new Error("Card não encontrado");
      const column = await devAgile.KanbanComlumns.findOne({
        where: { id: new_column_id },
      });
      if (!column) throw new Error("Coluna não encontrada");
      await devAgile.KanbanCards.update(
        { column_id: new_column_id },
        { where: { id: card_id }, transaction }
      );
      await transaction.commit();
      ws.broadcast({ type: "cardUpdated", card_id, new_column_id });
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
      const columns = await devAgile.KanbanComlumns.findAll({
        where: { setor_id },
      });
      if (!columns || !columns.length) return [];
      const columnIds = columns.map((c) => c.id);
      const cards = await devAgile.KanbanCards.findAll({
        where: { column_id: { [Op.in]: columnIds } },
        include: [{ model: devAgile.KanbanComlumns, as: "ColumnsCard" }],
      });
      return cards;
    } catch (error) {
      throw new Error("Erro ao buscar cards: " + error.message);
    }
  }

  async pegaCardPorID_Services(card_id) {
    try {
      const card = await devAgile.KanbanCards.findOne({
        where: { id: card_id },
        include: [
          {
            model: devAgile.KanbanComlumns,
            as: "ColumnsCard",
            attributes: ["nome"],
          },
          {
            model: devAgile.KanbanSessoes,
            as: "CardSessao",
            attributes: ["id"],
            include: [
              {
                model: devAgile.KanbanAtendenteHelpDesk,
                as: "SessaoAtendenteID",
                attributes: [],
                through: {
                  attributes: [
                    "visualizacao_atendente",
                    "atendente_id",
                    "createdAt",
                  ],
                },
              },
              {
                model: devAgile.KanbanSessoesMessages,
                as: "MessageSessao",
                attributes: [
                  "atendente_id",
                  "cliente_id",
                  "content_msg",
                  "createdAt",
                  "updatedAt",
                ],
                order: [["createdAt", "ASC"]],
                include: [
                  {
                    model: devAgile.Usuario,
                    as: "ClienteSessao",
                    attributes: ["nome"],
                  },
                  {
                    model: devAgile.KanbanAtendenteHelpDesk,
                    as: "AtendenteMessage",
                    attributes: ["id"],
                    include: [
                      {
                        model: devAgile.Usuario,
                        as: "UsuarioAtendente",
                        attributes: ["nome"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      return card;
    } catch (error) {
      throw new Error("Erro ao buscar cards: " + error.message);
    }
  }

  // NOVO MÉTODO: Atualiza os dados do email em uma mensagem existente
  // Aqui, 'message_record_id' é o ID interno do registro criado na criação do card.
  async atualizaEmailData_Services(message_record_id, emailData) {
    try {
      const message = await devAgile.KanbanSessoesMessages.findOne({
        where: { id: message_record_id },
      });
      if (!message) {
        return { error: true, message: "Mensagem não encontrada" };
      }
      await message.update(emailData);
      return {
        error: false,
        message: "Email atualizado com sucesso",
        updatedMessage: message,
      };
    } catch (error) {
      return {
        error: true,
        message: "Erro ao atualizar email: " + error.message,
      };
    }
  }
}

module.exports = KanbanCards_Services;
