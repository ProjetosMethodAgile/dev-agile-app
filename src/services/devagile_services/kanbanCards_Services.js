const { devAgile, sequelizeDevAgileCli } = require("../../models");
const { Op } = require("sequelize");
const uuid = require("uuid");
const ws = require("../../websocket.js");

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
      const card = await devAgile.KanbanCards.create(
        { id: uuid.v4(), column_id, src_img_capa, titulo_chamado, status },
        { transaction }
      );
      if (!card) throw new Error("Erro ao cadastrar card");

      const sessao = await devAgile.KanbanSessoes.create(
        { id: uuid.v4(), card_id: card.id },
        { transaction }
      );
      if (!sessao) throw new Error("Erro ao cadastrar sessão do card");

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

  async cadastraCardAuth_Services(
    column_id,
    src_img_capa,
    titulo_chamado,
    status,
    descricao,
    setor_id,
    usuario_id
  ) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      const card = await devAgile.KanbanCards.create(
        { id: uuid.v4(), column_id, src_img_capa, titulo_chamado, status },
        { transaction }
      );
      if (!card) throw new Error("Erro ao cadastrar card");

      const sessao = await devAgile.KanbanSessoes.create(
        { id: uuid.v4(), card_id: card.id },
        { transaction }
      );
      if (!sessao) throw new Error("Erro ao cadastrar sessão do card");

      const message = await devAgile.KanbanSessoesMessages.create(
        {
          id: uuid.v4(),
          sessao_id: sessao.id,
          content_msg: descricao,
          atendente_id: null,
          cliente_id: usuario_id,
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

  async replyMessage_Services({
    originalMsg,
    textBody,
    atendente_id,
    cliente_id,
    inReplyTo,
    from_email,
    message_id,
    htmlBody,
    to_email,
    cc_email,
    bcc_email,
    subject,
    references,
    system_msg,
  }) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // Obtemos o sessao_id e o id da mensagem original (para vinculação via in_reply_to)
      const { sessao_id } = originalMsg;

      // Cria a nova mensagem
      // Aqui, se email_message_id for fornecido, o armazenamos no campo message_id,
      // garantindo que o email que originou a resposta seja identificado.
      const newMsg = await devAgile.KanbanSessoesMessages.create(
        {
          id: uuid.v4(),
          sessao_id,
          atendente_id: atendente_id || null,
          cliente_id: cliente_id || null,
          content_msg: textBody,
          in_reply_to: inReplyTo, // referencia a mensagem original
          message_id: message_id || null, // grava o Message-ID do email, se existir
          from_email: from_email || null,
          to_email,
          cc_email,
          bcc_email,
          subject,
          references_email: references,
          system_msg,
        },
        { transaction }
      );

      await transaction.commit();
      return { error: false, data: newMsg };
    } catch (err) {
      await transaction.rollback();
      return { error: true, message: err.message };
    }
  }

  async pegaMensagemPorId_Services(msgId) {
    return await devAgile.KanbanSessoesMessages.findOne({
      where: { message_id: msgId },
    });
  }

  //consumido pela lambda para atualizar os dados da menssagem com o email_id na clausula where informações que contem no arquivo .eml
  async atualizaEmailDataPorEmailID_Service(id, emailData) {
    try {
      const message = await devAgile.KanbanSessoesMessages.findOne({
        where: { message_id: id },
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

  //normalmente utilizado na criação do card para amarrar o email_id na menssagem antes de chegar na lambda
  async atualizaEmailDataPorID_Service(id, emailData) {
    try {
      const message = await devAgile.KanbanSessoesMessages.findOne({
        where: { id: id },
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
        include: [
          { model: devAgile.KanbanComlumns, as: "ColumnsCard" },
          {
            model: devAgile.KanbanSessoes,
            as: "CardSessao",
            attributes: ["id"],
            include: [
              {
                model: devAgile.KanbanAtendenteHelpDesk,
                as: "atendentesVinculados",
                attributes: ["createdAt"],
                include: [
                  {
                    model: devAgile.Usuario,
                    as: "UsuarioAtendente",
                    attributes: ["nome", "email", "contato"],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Extraia os IDs das sessões de cada card
      const sessionIds = cards
        .filter((card) => card.CardSessao) // garante que CardSessao exista
        .map((card) => card.CardSessao.id);

      // Consulta agregada para contar mensagens e anexos por sessão
      const messagesAndAttachments =
        await devAgile.KanbanSessoesMessages.findAll({
          attributes: [
            "sessao_id",
            // Conta quantas mensagens únicas existem por sessão
            [
              sequelizeDevAgileCli.literal(
                'COUNT(DISTINCT "KanbanSessoesMessages"."id")'
              ),
              "messagesCount",
            ],
            // Conta quantos anexos únicos existem por sessão (via join com Attachments)
            [
              sequelizeDevAgileCli.literal(
                'COUNT(DISTINCT "Attachments"."id")'
              ),
              "attachmentsCount",
            ],
          ],
          where: { sessao_id: { [Op.in]: sessionIds } },
          include: [
            {
              model: devAgile.KanbanSessoesMessagesAttachments,
              as: "Attachments",
              attributes: [], // Não traz atributos dos anexos; serve só para o join
            },
          ],
          group: ["sessao_id"],
          raw: true,
        });

      // Agora, o objeto messagesAndAttachments conterá para cada sessao_id
      // a quantidade de mensagens (messagesCount) e de anexos (attachmentsCount)
      const cardsWithCounts = cards.map((card) => {
        const sessaoId = card.CardSessao?.id;
        const countInfo = messagesAndAttachments.find(
          (info) => info.sessao_id === sessaoId
        );
        return {
          ...card.toJSON(),
          messagesCount: countInfo ? countInfo.messagesCount : 0,
          attachmentsCount: countInfo ? countInfo.attachmentsCount : 0,
        };
      });

      return cardsWithCounts;
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
                as: "atendentesVinculados",
                attributes: ["createdAt"],
                include: [
                  {
                    model: devAgile.Usuario,
                    as: "UsuarioAtendente",
                    attributes: ["nome", "email", "contato"],
                  },
                ],
              },
              {
                model: devAgile.KanbanSessoesMessages,
                as: "MessageSessao",
                attributes: [
                  "message_id",
                  "references_email",
                  "in_reply_to",
                  "from_email",
                  "to_email",
                  "cc_email",
                  "subject",
                  "atendente_id",
                  "system_msg",
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
                    attributes: ["nome", "email"],
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
}

module.exports = KanbanCards_Services;
