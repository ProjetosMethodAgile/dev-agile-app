const Services = require("../Services.js");

const { devAgile, sequelizeDevAgileCli } = require("../../models");

const uuid = require("uuid");

class kanban_Acao_Services extends Services {
  constructor() {
    super("KanbanAcoes");
  }

  async pegaTodoskanban_Acao_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  async pegaAcaoPorColumnId_Services(id) {
    const columnsList = await devAgile.KanbanComlumns.findOne({
      where: { id },
      include: [
        {
          model: devAgile.KanbanAcoes,
          as: "ColumnAcoes",
          through: { attributes: [] },
        },
      ],
    });

    return columnsList;
  }

  async criaAcaoKanban_Services(dados) {
    try {
      const acao = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
      });

      const vinculaAcaoEmpID = await devAgile.KanbanAcaoEmpresa.create({
        id: uuid.v4(),
        empresa_id: dados.empID,
        kanban_acao_id: acao.dataValues.id,
      });

      return { error: false, message: "Cadastro realizado com sucesso" };
    } catch (err) {
      console.error("Erro ao criar ação:", err);
      return { error: true, message: "Erro ao criar Ação" };
    }
  }

  async validaAcaoID(id) {
    try {
      return devAgile[this.nomeModel].findOne({
        where: { id },
      });
    } catch (err) {
      console.error("Erro ao localizar id acao:", err);
      return { error: true, message: "Erro ao localizar id ação" };
    }
  }

  async pegaTodosAcaoEmpresa_Services(id) {
    return await devAgile.KanbanAcaoEmpresa.findAll({
      where: { empresa_id: id },
      attributes: ["kanban_acao_id"],
      include: [
        {
          model: devAgile.KanbanAcoes,
          as: "kanban_empresa_por_acao",
        },
      ],
    });
  }

  async changeStatusCard_Services(card_id, statusObj, empresa_id, usuario_id) {
    let transaction;
    try {
      // 1) Abre a transação
      transaction = await sequelizeDevAgileCli.transaction();

      // 2) Busca o card **antes** de atualizar, para capturar o status antigo
      const card = await devAgile.KanbanCards.findOne({
        where: { id: card_id },
        include: [{ model: devAgile.KanbanComlumns, as: "ColumnsCard" }],
        transaction,
      });
      if (!card) throw new Error("Card não encontrado");

      const previousStatusId = card.status_card_id;

      // 3) Atualiza somente o card desejado
      await devAgile.KanbanCards.update(
        { status_card_id: statusObj.id },
        { where: { id: card_id }, transaction }
      );

      // 4) Busca o atendente para registrar quem mudou
      const atendente = await devAgile.KanbanAtendenteHelpDesk.findOne({
        where: { usuario_id },
        transaction,
      });
      if (!atendente) throw new Error("Atendente não encontrado");

      // 5) Grava no histórico usando o previousStatusId capturado
      await devAgile.KanbanStatusHistory.create(
        {
          id: uuid.v4(),
          card_id,
          status_card_id: statusObj.id,
          previous_status_card_id: previousStatusId,
          changed_by: atendente.id,
          usuario_id: null,
          empresa_id,
          setor_id: card.ColumnsCard.setor_id,
          action_type: "status_change",
          previous_column: card.ColumnsCard.nome,
          column_atual: card.ColumnsCard.nome,
        },
        { transaction }
      );

      // 6) Commit para persistir tudo
      await transaction.commit();

      return {
        status: true,
        message: "Status alterado com sucesso",
        setor: card.ColumnsCard.setor_id,
      };
    } catch (err) {
      // garante rollback mesmo que transaction não exista
      if (transaction) await transaction.rollback();
      console.error(err);
      return {
        status: false,
        message: "Erro ao alterar status: " + err.message,
      };
    }
  }
}

module.exports = kanban_Acao_Services;
