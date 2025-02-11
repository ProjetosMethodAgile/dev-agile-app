const Controller = require("../Controller.js");
const Empresa_Services = require("../../services/devagile_services/Empresa_Services.js");

const empresa_services = new Empresa_Services();
// Incluímos "tag" na lista de campos obrigatórios, pois é um campo obrigatório na migration.
const camposObrigatorios = ["nome", "descricao", "endereco", "cnpj", "tag"];

class Empresa_Controller extends Controller {
  constructor() {
    super(empresa_services, camposObrigatorios);
  }

  // Buscar todas as empresas
  async pegaTodasEmpresas_Controller(req, res) {
    try {
      const listaDeEmpresas =
        await empresa_services.pegaTodasEmpresas_Services();
      return res.status(200).json(listaDeEmpresas);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Erro ao buscar empresas, contate o administrador do sistema",
      });
    }
  }

  // Criar nova empresa
  async criaEmpresa_Controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
      if (isTrue.status) {
        const {
          nome,
          descricao,
          endereco,
          cnpj,
          tag,
          logo,
          cor_primaria,
          cor_secundaria,
        } = req.body;
        const empresa = await empresa_services.criaEmpresa_Services({
          nome,
          descricao,
          endereco,
          cnpj,
          tag,
          logo,
          cor_primaria,
          cor_secundaria,
        });
        if (empresa.error) {
          return res.status(500).json({
            message: "Já existe uma empresa com o nome informado",
            error: empresa.error,
          });
        } else {
          return res.status(200).json({
            message: "Empresa criada com sucesso",
            error: false,
            empresa,
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
        message: "Erro ao criar empresa, contate o administrador do sistema",
      });
    }
  }

  // Buscar empresa por ID
  async pegaEmpresaPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const empresa = await empresa_services.pegaEmpresaPorId_Services(id);
      if (!empresa) {
        return res.status(400).json({
          message: `Não foi possível encontrar a empresa com o ID: ${id}`,
        });
      } else {
        return res.status(200).json(empresa);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Erro ao buscar empresa, contate o administrador do sistema",
      });
    }
  }

  // Deletar empresa por ID
  async deletaEmpresaPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const empresa = await empresa_services.deletaEmpresaPorId_Services(id);
      if (empresa.error) {
        return res.status(400).json({ message: empresa.message, error: true });
      } else {
        return res.status(200).json({ message: empresa.message, error: false });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Erro ao deletar empresa, contate o administrador do sistema",
      });
    }
  }

  // Atualizar empresa por ID
  async atualizaEmpresaPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const {
        nome,
        descricao,
        endereco,
        cnpj,
        tag,
        logo,
        cor_primaria,
        cor_secundaria,
      } = req.body;
      const empresaAtualizada =
        await empresa_services.atualizaEmpresaPorId_Services(id, {
          nome,
          descricao,
          endereco,
          cnpj,
          tag,
          logo,
          cor_primaria,
          cor_secundaria,
        });
      if (!empresaAtualizada) {
        return res
          .status(404)
          .json({ message: `Empresa com o ID ${id} não encontrada` });
      }
      return res.status(200).json({
        message: `Empresa com o ID ${id} atualizada com sucesso`,
        empresaAtualizada,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message:
          "Erro ao atualizar empresa, contate o administrador do sistema",
      });
    }
  }
}

module.exports = Empresa_Controller;
