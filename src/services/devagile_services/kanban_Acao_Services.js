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

  async pegaTodosAcaoEmpresa_Services(id) {
    return devAgile[this.nomeModel].findOne({include:[
      {
        model: devAgile.Empresa,
        as: 'kanbanAcaoEmpresas'
      }
    ]});
  }
}

module.exports = kanban_Acao_Services;
