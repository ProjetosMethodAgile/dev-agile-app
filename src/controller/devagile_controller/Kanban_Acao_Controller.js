const kanban_Acao_Services = require("../../services/devagile_services/kanban_Acao_Services.js");
const Empresa_Services = require("../../services/devagile_services/Empresa_Services.js");
const Controller = require("../Controller.js");

const kanban_acao_services = new kanban_Acao_Services();
const camposObrigatorios = ["nome", "permissao_id"]; // a ação precisa estar vinculada a uma tela (permissao)
const empresa_service = new Empresa_Services()

class Kanban_Acao_Controller extends Controller {
  constructor() {
    super(kanban_acao_services, camposObrigatorios);
  }


  async pegaTodosKanban_Acao_Controller(req, res) {
    try {
      const lista = await kanban_acao_services.pegaTodoskanban_Acao_Services();
      return res.status(200).json(lista);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao buscar registros" });
    }
  }

  async pegaTodosAcaoPorEmpresa_Controller(req, res) {
    try {
      const {id} = req.params
      if(!id){
        return res.status(400).json({ message: "Erro ao buscar registros" });
      }
      const empresa = await empresa_service.pegaEmpresaPorId_Services(id)
      
      if(!empresa){
        return res.status(400).json({ message: "Erro ao buscar registros" })
      }
      const lista = await kanban_acao_services.pegaTodosAcaoEmpresa_Services(id);
      return res.status(200).json(lista);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao buscar registros" });
    }
  }

}

module.exports = Kanban_Acao_Controller;
