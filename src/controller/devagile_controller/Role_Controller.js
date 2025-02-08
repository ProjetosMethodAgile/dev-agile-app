const Role_Services = require("../../services/devagile_services/role_Services.js");
const Controller = require("../Controller.js");

const role_services = new Role_Services();
const camposObrigatorios = ["nome", "descricao"];

class Role_Controller extends Controller {
  constructor() {
    super(role_services, camposObrigatorios);
  }

  async pegaTodosRole_Controller(req, res) {
    try {
      const listaDeRegistro = await role_services.pegaTodosRole_Services();
      return res.status(200).json(listaDeRegistro);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }

  async criaRole_Controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
      if (isTrue.status) {
        const { nome, descricao } = req.body;
        const role = await role_services.criaRole_Services({ nome, descricao });
        if (role.error) {
          return res.status(500).json({
            message: "já existe uma role com o nome informado",
            error: role.error,
          });
        } else {
          return res.status(200).json({
            message: "Cargo criado",
            error: role.error,
            role: role,
          });
        }
      } else {
        return res.status(500).json({
          message: "Preencha todos os campos necessarios",
          campos: isTrue.campos,
          error: true,
        });
      }
    } catch (e) {
      console.log(e);
      return res
        .status(400)
        .json({ message: `erro ao criar, contate o administrador do sistema` });
    }
  }

  async pegaRolePorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const role = await role_services.pegaRolePorId_Services(id);
      if (role == null) {
        return res.status(400).json({
          message: `não foi possivel encontrar o registro: ${id}`,
          role,
        });
      } else {
        return res.status(200).json(role);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }

  async deletaRolePorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const role = await role_services.deletaRolePorId_Services(id);
      if (role === 0) {
        return res
          .status(400)
          .json({ message: `id ${id} não encontrado`, role, error: true });
      } else {
        return res
          .status(200)
          .json({ message: `id ${id} deletado`, role, error: false });
      }
    } catch (error) {
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }

  //método para pegar permissões associadas a uma role
  async pegaPermissoesPorRole_Controller(req, res) {
    const { id } = req.params;
    try {
      const permissoes = await role_services.pegaPermissoesPorRole_Services(id);
      if (!permissoes) {
        return res.status(404).json({
          message: "Cargo não encontrado ou sem permissões associadas",
        });
      }
      return res.status(200).json(permissoes);
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ message: "Erro ao buscar permissões", error: e.message });
    }
  }
}

module.exports = Role_Controller;
