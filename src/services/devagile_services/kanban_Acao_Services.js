const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
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
}

module.exports = kanban_Acao_Services;
