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
    descricao,
    setor_id,
    usuario_id,
    empresa_id
  ) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // 1) busca o status "Em Andamento"
      const statusObj = await devAgile.KanbanStatusCard.findOne({
        where: { nome: "Em Aberto" },
        transaction,
      });
      if (!statusObj) throw new Error('Status "Em Aberto" não encontrado');

      // 2) cria o card
      const card = await devAgile.KanbanCards.create(
        {
          id: uuid.v4(),
          column_id,
          src_img_capa,
          titulo_chamado,
          status_card_id: statusObj.id,
        },
        { transaction }
      );

      // 3) registra no histórico
      await devAgile.KanbanStatusHistory.create(
        {
          id: uuid.v4(),
          card_id: card.id,
          status_card_id: statusObj.id,
          previous_status_card_id: null,
          changed_by: null, // nenhum atendente ainda
          usuario_id, // quem abriu o chamado
          empresa_id: empresa_id,
          setor_id,
          action_type: "create_card",
        },
        { transaction }
      );

      // 4) cria a sessão
      const sessao = await devAgile.KanbanSessoes.create(
        {
          id: uuid.v4(),
          card_id: card.id,
        },
        { transaction }
      );

      // 5) cria a mensagem inicial do cliente
      const message = await devAgile.KanbanSessoesMessages.create(
        {
          id: uuid.v4(),
          sessao_id: sessao.id,
          content_msg: descricao,
          atendente_id: null,
          cliente_id: usuario_id,
          message_id: null,
          system_msg: false,
        },
        { transaction }
      );

      await transaction.commit();

      // broadcast do novo card
      ws.broadcast({ type: `cardCreated-${setor_id}`, card });

      return {
        card,
        createdMessage: message,
        error: false,
        message: "Cadastro realizado com sucesso",
      };
    } catch (error) {
      console.log(error);

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
      // 1) Busca sessão e card, trazendo coluna e setor
      const sessao = await devAgile.KanbanSessoes.findByPk(
        originalMsg.sessao_id,
        { transaction }
      );
      if (!sessao) throw new Error("Sessão não encontrada");

      const card = await devAgile.KanbanCards.findByPk(sessao.card_id, {
        include: [
          {
            model: devAgile.KanbanComlumns,
            as: "ColumnsCard",
            include: [
              {
                model: devAgile.KanbanSetores,
                as: "ColumnSetor",
              },
            ],
          },
        ],
        transaction,
      });
      if (!card) throw new Error("Card não encontrado para a sessão");

      // extrai os valores que precisamos
      const column = card.ColumnsCard;
      const setorId = column.setor_id;
      const empresaId = column.ColumnSetor.empresa_id;
      const columnName = column.nome;

      // 2) cria a nova mensagem
      const newMsg = await devAgile.KanbanSessoesMessages.create(
        {
          id: uuid.v4(),
          sessao_id: sessao.id,
          atendente_id: atendente_id || null,
          cliente_id: cliente_id || null,
          content_msg: textBody,
          in_reply_to: inReplyTo,
          message_id: message_id || null,
          from_email: from_email || null,
          to_email,
          cc_email,
          bcc_email,
          subject,
          references_email: references,
          system_msg: !!system_msg,
        },
        { transaction }
      );

      // 3) grava registro no histórico
      await devAgile.KanbanStatusHistory.create(
        {
          id: uuid.v4(),
          card_id: card.id,
          status_card_id: card.status_card_id,
          previous_status_card_id: card.status_card_id,
          changed_by: atendente_id || null,
          usuario_id: cliente_id || null,
          empresa_id: empresaId,
          setor_id: setorId,
          action_type: system_msg
            ? "message_system"
            : atendente_id
            ? "message_attendant"
            : "message_client",
          previous_column: columnName,
          column_atual: columnName,
        },
        { transaction }
      );

      // 4) commit e retorno
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

  async atualizaColumnCard_Services(
    card_id,
    new_column_id,
    setor_id,
    columnAtualName,
    empresa_id,
    changed_by
  ) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // 1) busca o card e seu status atual e empresa
      const card = await devAgile.KanbanCards.findOne({
        where: { id: card_id },
        include: [{ model: devAgile.KanbanComlumns, as: "ColumnsCard" }],
        transaction,
      });

      if (!card) throw new Error("Card não encontrado");

      const previousColumnName = card.ColumnsCard.nome;
      const previousStatusId = card.status_card_id;

      // 2) atualiza apenas a coluna
      await devAgile.KanbanCards.update(
        { column_id: new_column_id },
        { where: { id: card_id }, transaction }
      );

      // 3) registra no histórico como 'column_move'
      await devAgile.KanbanStatusHistory.create(
        {
          id: uuid.v4(),
          card_id: card.id,
          status_card_id: previousStatusId,
          previous_status_card_id: previousStatusId,
          changed_by, // o atendente que moveu
          usuario_id: null, // não é ação de cliente
          empresa_id,
          setor_id,
          action_type: "column_move",
          previous_column: previousColumnName,
          column_atual: columnAtualName,
        },
        { transaction }
      );

      await transaction.commit();

      // 4) broadcast genérico (se desejar)
      ws.broadcast({ type: "cardUpdated", card_id, new_column_id });

      return { error: false, message: "Coluna do card atualizada com sucesso" };
    } catch (error) {
      console.log(error);

      await transaction.rollback();
      return {
        error: true,
        message: "Erro ao atualizar coluna do card: " + error.message,
      };
    }
  }

  async pegaCardsPorSetorID_Services(setor_id) {
    try {
      // 1) Busca colunas do setor
      const columns = await devAgile.KanbanComlumns.findAll({
        where: { setor_id },
      });
      if (!columns.length) return [];

      const columnIds = columns.map((c) => c.id);

      // 2) Busca cards, incluindo coluna, status e sessão
      const cards = await devAgile.KanbanCards.findAll({
        where: { column_id: { [Op.in]: columnIds } },
        include: [
          {
            model: devAgile.KanbanComlumns,
            as: "ColumnsCard",
          },
          {
            model: devAgile.KanbanStatusCard,
            as: "status",
            attributes: ["id", "nome", "descricao", "color"],
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
            ],
          },
        ],
        attributes: [
          "id",
          "column_id",
          "src_img_capa",
          "titulo_chamado",
          "status_card_id",
          "createdAt",
          "updatedAt",
        ],
      });

      // 3) Contagem de mensagens e anexos por sessão
      const sessionIds = cards
        .filter((c) => c.CardSessao)
        .map((c) => c.CardSessao.id);

      const messagesAndAttachments =
        await devAgile.KanbanSessoesMessages.findAll({
          attributes: [
            "sessao_id",
            [
              sequelizeDevAgileCli.literal(
                'COUNT(DISTINCT "KanbanSessoesMessages"."id")'
              ),
              "messagesCount",
            ],
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
              attributes: [],
            },
          ],
          group: ["sessao_id"],
          raw: true,
        });

      // 4) Projeção final do JSON para o front
      const cardsWithCounts = cards.map((card) => {
        const json = card.toJSON();
        const counts = messagesAndAttachments.find(
          (m) => m.sessao_id === json.CardSessao?.id
        ) || {
          messagesCount: 0,
          attachmentsCount: 0,
        };

        return {
          id: json.id,
          column_id: json.column_id,
          src_img_capa: json.src_img_capa,
          titulo_chamado: json.titulo_chamado,
          status_card_id: json.status_card_id,
          status: json.status, // objeto { id, nome, descricao?, color? }
          createdAt: json.createdAt,
          updatedAt: json.updatedAt,
          ColumnsCard: json.ColumnsCard,
          CardSessao: json.CardSessao,
          messagesCount: counts.messagesCount,
          attachmentsCount: counts.attachmentsCount,
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

        // *** Aqui usamos createdAt/updatedAt (camelCase) ***
        attributes: [
          "id",
          "column_id",
          "src_img_capa",
          "titulo_chamado",
          "status_card_id",
          "createdAt",
          "updatedAt",
        ],

        include: [
          {
            model: devAgile.KanbanComlumns,
            as: "ColumnsCard",
            attributes: ["nome"],
          },
          {
            model: devAgile.KanbanStatusCard,
            as: "status",
            attributes: ["id", "nome", "color"],
          },
          {
            model: devAgile.KanbanSessoes,
            as: "CardSessao",
            attributes: ["id", "createdAt", "updatedAt"],
            include: [
              {
                model: devAgile.KanbanAtendenteHelpDesk,
                as: "atendentesVinculados",
                // idem: camelCase aqui também
                attributes: ["id", "createdAt"],
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
                separate: true,
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

      return card?.toJSON() ?? null;
    } catch (error) {
      throw new Error("Erro ao buscar card: " + error.message);
    }
  }
}

module.exports = KanbanCards_Services;
