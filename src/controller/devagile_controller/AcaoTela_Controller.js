const { devAgile } = require("../../models/index.js");
const AcaoTela_Services = require("../../services/devagile_services/AcaoTela_Services.js");
const Controller = require("../Controller.js");

const acaoTela_services = new AcaoTela_Services();
const camposObrigatorios = ["nome", "permissao_id"]; // a ação precisa estar vinculada a uma tela (permissao)

class AcaoTela_Controller extends Controller {
  constructor() {
    super(acaoTela_services, camposObrigatorios);
  }

  async pegaTodosAcaoTela_Controller(req, res) {
    try {
      const lista = await acaoTela_services.pegaTodosAcaoTela_Services();
      return res.status(200).json(lista);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao buscar registros" });
    }
  }

  async criaAcaoTela_Controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
      const { nome, descricao, permissao_id } = req.body;

      if (isTrue.status) {
        const acaoResult = await acaoTela_services.criaAcaoTela_Services({
          nome,
          descricao,
          permissao_id,
        });
        if (acaoResult.error) {
          return res.status(500).json({
            message: "Já existe uma ação com o nome informado para esta tela",
            error: acaoResult.error,
          });
        } else {
          return res.status(200).json({
            message: "Ação criada com sucesso",
            acao: acaoResult.acao,
          });
        }
      } else {
        return res.status(500).json({
          message: "Preencha todos os campos necessários",
          campos: isTrue.campos,
          error: true,
        });
      }
    } catch (e) {
      console.error(e);
      return res
        .status(400)
        .json({
          message: "Erro ao criar ação, contate o administrador do sistema",
        });
    }
  }

  async pegaAcaoTelaPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const acao = await acaoTela_services.pegaAcaoTelaPorId_Services(id);
      if (!acao) {
        return res.status(400).json({
          message: `Não foi possível encontrar o registro: ${id}`,
          acao,
        });
      } else {
        return res.status(200).json(acao);
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao buscar registro, contate o administrador do sistema",
      });
    }
  }

  async deletaAcaoTelaPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const acao = await acaoTela_services.deletaAcaoTelaPorId_Services(id);
      if (acao === 0) {
        return res.status(400).json({
          message: `ID ${id} não encontrado`,
          acao,
          error: true,
        });
      } else {
        return res.status(200).json({
          message: `ID ${id} deletado`,
          acao,
          error: false,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao deletar registro, contate o administrador do sistema",
      });
    }
  }
}

module.exports = AcaoTela_Controller;
