const { devAgile } = require("../../models/index.js");
const Permissao_Services = require("../../services/devagile_services/permissao_Services.js");
const Controller = require("../controller.js");

const permissao_services = new Permissao_Services();
const camposObrigatorios = ["nome", "descricao"];

class Permissao_Controller extends Controller {
  constructor() {
    super(permissao_services, camposObrigatorios);
  }

  async pegaTodosPermissao_Controller(req, res) {
    try {
      const listaDeRegistro =
        await permissao_services.pegaTodosPermissao_Services();
      return res.status(200).json(listaDeRegistro);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }

  async criaPermissao_Controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
      // Verifique se o roleId foi fornecido e se é um array
      const { nome, descricao, roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
        return res.status(400).json({
          message:
            "O campo roleIds é obrigatório e deve ser um array de IDs de roles.",
        });
      }

      // Busca todas as roles baseadas no array de roleIds
      const roles = await devAgile.Role.findAll({
        where: {
          id: roleIds,
        },
      });

      if (roles.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma Role encontrada com os IDs fornecidos" });
      }

      if (isTrue.status) {
        const permissaoResult = await permissao_services.criaPermissao_Services(
          { nome, descricao }
        );
        if (permissaoResult.error) {
          return res.status(500).json({
            message: "Já existe uma permissão com o nome informado",
            error: permissaoResult.error,
          });
        } else {
          const permissao = permissaoResult.permissao;

          // Associa a permissão a todas as roles fornecidas
          await permissao.addRoles(roles); // Adiciona as roles à permissão

          // Busca novamente a permissão com as roles associadas
          const permissaoComRoles = await devAgile.Permissao.findByPk(
            permissao.id,
            {
              include: [
                {
                  model: devAgile.Role,
                  as: "roles", // Inclui as roles associadas
                  through: { attributes: [] }, // Oculta atributos da tabela intermediária
                },
              ],
            }
          );

          return res.status(200).json({
            message: "Permissão criada e vinculada às roles com sucesso",
            permissao: permissaoComRoles,
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
      return res
        .status(400)
        .json({ message: `Erro ao criar, contate o administrador do sistema` });
    }
  }

  async pegaPermissaoPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const permissao = await permissao_services.pegaPermissaoPorId_Services(
        id
      );
      if (permissao == null) {
        return res.status(400).json({
          message: `não foi possivel encontrar o registro: ${id}`,
          permissao,
        });
      } else {
        return res.status(200).json(permissao);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }

  async deletaPermissaoPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const permissao = await permissao_services.deletaPermissaoPorId_Services(
        id
      );
      if (permissao === 0) {
        return res
          .status(400)
          .json({ message: `id ${id} não encontrado`, permissao, error: true });
      } else {
        return res
          .status(200)
          .json({ message: `id ${id} deletado`, permissao, error: false });
      }
    } catch (error) {
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }
}

module.exports = Permissao_Controller;
