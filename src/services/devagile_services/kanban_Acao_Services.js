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
  async criaAcaoKanban_Services(dados) {
    try {
      return await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao
      });
    } catch (err) {
      console.error("Erro ao criar motivo:", err);
      return { error: true, message: "Erro ao criar motivo" };
    }
  }


  async validaAcaoID(id){
    try {
        return devAgile[this.nomeModel].findOne({
          where:{id}
        })
      }
      catch (err) {
        console.error("Erro ao localizar id acao:", err);
        return { error: true, message: "Erro ao localizar id ação" };
      }
  }

  async pegaTodosAcaoEmpresa_Services(id) {
    return devAgile[this.nomeModel].findOne({
      include: [
        {
          model: devAgile.Empresa,
          as: "kanbanAcaoEmpresas",
        },
      ],
    });
  }
}

module.exports = kanban_Acao_Services;
