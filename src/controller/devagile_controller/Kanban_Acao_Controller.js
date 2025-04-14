const kanban_Acao_Services = require("../../services/devagile_services/kanban_Acao_Services.js");
const Empresa_Services = require("../../services/devagile_services/Empresa_Services.js");
const Controller = require("../Controller.js");

const kanban_acao_services = new kanban_Acao_Services();
const camposObrigatorios = ["nome","empID","descricao"]; // a ação precisa estar vinculada a uma tela (permissao)
const empresa_service = new Empresa_Services();

class Kanban_Acao_Controller extends Controller {
  constructor() {
    super(kanban_acao_services, camposObrigatorios);
  }

  async criaAcaoKanban_controller(req, res) {
    const data = req.body;
    if (!data.nome || !data.descricao||!data.empID) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }
    try {
      const acao = await kanban_acao_services.criaAcaoKanban_Services(data);
      if (!acao.error) {
        console.log(acao);
        return res
          .status(200)
          .json({ message: `Cadastro da ação realizada com sucesso` });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao cadastrar Acao" });
    }
  }

  async vinculaAcaoNaColunaPorID_controller(req, res) {
    const data = req.body;
    if (!data.id_column || !data.id_acao) {
      return res.status(400).json({ message: "id não informado" });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(data.id_column)) {
      return res.status(400).json({ message: "UUID coluna inválido" });
    }
    if (!uuidRegex.test(data.id_acao)) {
      return res.status(400).json({ message: "UUID acao inválido" });
    }
    
    const validaAcaoCadastrada = await kanban_acao_services.validaAcaoID(data.id_acao)
    if (!validaAcaoCadastrada) {
      return res.status(400).json({ message: "UUID não cadastrado" });
    }

    try {
      const acao = await kanban_acao_services.vinculaAcaoKanban_Services(data);  
      if (!acao.error) {
        console.log(acao);
        return res
          .status(200)
          .json({ message: `Vinculo da ação realizada com sucesso` });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao vincular Acao" });
    }
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
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Erro ao buscar registros" });
      }
      const empresa = await empresa_service.pegaEmpresaPorId_Services(id);
    
      
      if (!empresa) {
        return res.status(400).json({ message: "Erro ao buscar registros" });
      }
      const lista = await kanban_acao_services.pegaTodosAcaoEmpresa_Services(
        empresa.id
      );
     
      
      return res.status(200).json(lista);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao buscar registros" });
    }
  }
}

module.exports = Kanban_Acao_Controller;
