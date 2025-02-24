const TipoPermissao_Services = require("../../services/devagile_services/TipoPermissao_Services.js");
const Controller = require("../Controller.js");

const tipoPermissao_services = new TipoPermissao_Services();
const camposObrigatorios = ["nome", "descricao"];

class TipoPermissao_Controller extends Controller {
  constructor() {
    super(tipoPermissao_services, camposObrigatorios);
  }

  async pegaTodosTipoPermissao_Controller(req, res) {
    try {
      const listaDeRegistro =
        await tipoPermissao_services.pegaTodosTipoPermissao_Services();
      return res.status(200).json(listaDeRegistro);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `Erro ao buscar registros, contate o administrador do sistema`,
      });
    }
  }

  async criaTipoPermissao_Controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
      if (isTrue.status) {
        const { nome, descricao } = req.body;
        const tipoPermissao =
          await tipoPermissao_services.criaTipoPermissao_Services({
            nome,
            descricao,
          });
        if (tipoPermissao.error) {
          return res.status(500).json({
            message: "Já existe um tipo de permissão com o nome informado",
            error: tipoPermissao.error,
          });
        } else {
          return res.status(200).json({
            message: "Tipo de permissão criado",
            error: tipoPermissao.error,
            tipoPermissao: tipoPermissao,
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
      console.log(e);
      return res.status(400).json({
        message: `Erro ao criar, contate o administrador do sistema`,
      });
    }
  }

  async pegaTipoPermissaoPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const tipoPermissao =
        await tipoPermissao_services.pegaTipoPermissaoPorId_Services(id);
      if (tipoPermissao == null) {
        return res.status(400).json({
          message: `Não foi possível encontrar o registro: ${id}`,
          tipoPermissao,
        });
      } else {
        return res.status(200).json(tipoPermissao);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `Erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }

  async deletaTipoPermissaoPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const tipoPermissao =
        await tipoPermissao_services.deletaTipoPermissaoPorId_Services(id);
      if (tipoPermissao === 0) {
        return res.status(400).json({
          message: `ID ${id} não encontrado`,
          tipoPermissao,
          error: true,
        });
      } else {
        return res.status(200).json({
          message: `ID ${id} deletado`,
          tipoPermissao,
          error: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: `Erro ao deletar, contate o administrador do sistema`,
      });
    }
  }
}

module.exports = TipoPermissao_Controller;
