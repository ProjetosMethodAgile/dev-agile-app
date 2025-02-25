const { devAgile } = require("../../models/index.js");
const Permissao_Services = require("../../services/devagile_services/Permissao_Services.js");
const Tipo_Permissao_Services = require("../../services/devagile_services/TipoPermissao_Services.js");
const Role_Services = require("../../services/devagile_services/Role_Services.js");
const Controller = require("../Controller.js");

const permissao_services = new Permissao_Services();
const tipo_permissao_services = new Tipo_Permissao_Services();
const role_services = new Role_Services();
const camposObrigatorios = ["nome", "descricao", "tipo_permissao_id"];

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

  async pegaPermissaoEacoesPorUserId_Controller(req, res) {
    const { id } = req.params;
    try {
      const permissoes =
        await permissao_services.pegaPermissaoEacoesPorUserId_Services(id);
      return res.status(200).json({ status: true, permissoes });
    } catch (error) {
      console.error("Erro em pegaPermissaoEacoesPorUserId_Controller:", error);
      return res.status(500).json({ status: false, message: error.message });
    }
  }

  async criaPermissao_Controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
      const { nome, descricao, roleIds, parent_id, tipo_permissao_id } =
        req.body;

      // Validação de roleIds
      if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
        return res.status(400).json({
          message:
            "O campo roleIds é obrigatório e deve ser um array de IDs de roles.",
        });
      }

      // Busca todas as roles informadas
      const roles = await devAgile.Role.findAll({ where: { id: roleIds } });

      if (roles.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma Role encontrada com os IDs fornecidos" });
      }

      // Validação do parent_id (se informado)
      let parentPermissao = null;
      if (parent_id) {
        parentPermissao = await devAgile.Permissao.findByPk(parent_id);
        if (!parentPermissao) {
          return res
            .status(404)
            .json({ message: "Permissão pai não encontrada" });
        }
      }

      // Validação do tipo_permissao_id (se informado)
      let tipoPermissao = null;
      if (tipo_permissao_id) {
        console.log(tipo_permissao_id);

        tipoPermissao = await devAgile.tipo_permissoes.findByPk(
          tipo_permissao_id
        );
        if (!tipoPermissao) {
          return res
            .status(404)
            .json({ message: "Tipo de Permissão não encontrado" });
        }
      }

      if (isTrue.status) {
        const permissaoResult = await permissao_services.criaPermissao_Services(
          {
            nome,
            descricao,
            parent_id,
            tipo_permissao_id,
          }
        );

        if (permissaoResult.error) {
          return res.status(500).json({
            message: "Já existe uma permissão com o nome informado",
            error: permissaoResult.error,
          });
        } else {
          const permissao = permissaoResult.permissao;

          // Associa a permissão às roles fornecidas
          await permissao.addRoles(roles);

          // Busca novamente a permissão com as roles associadas
          // const permissaoComRoles = await devAgile.Permissao.findByPk(
          //   permissao.id,
          //   {
          //     include: [
          //       {
          //         model: devAgile.Role,
          //         as: "roles",
          //         through: { attributes: [] },
          //       },
          //       { model: devAgile.Permissao },
          //       { model: devAgile.TipoPermissao },
          //     ],
          //   }
          // );

          return res.status(200).json({
            message: "Permissão criada e vinculada às roles com sucesso",
            // permissao: permissaoComRoles,
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

  async atualizaPermissao_Controller(req, res) {
    const { id } = req.params;
    const { nome, descricao, parent_id, tipo_permissao_id, roleIds } = req.body;

    try {
      // Verifica se a permissão existe
      const permissao = await permissao_services.pegaPermissaoPorId_Services(
        id
      );
      if (!permissao) {
        return res.status(404).json({ message: "Permissão não encontrada" });
      }

      // Validação do tipo_permissao_id (se informado)
      if (tipo_permissao_id) {
        const tipoPermissao =
          await tipo_permissao_services.pegaTipoPermissaoPorId_Services(
            tipo_permissao_id
          );
        if (!tipoPermissao) {
          return res
            .status(404)
            .json({ message: "Tipo de permissão não encontrado" });
        }
      }

      // Validação do parent_id (se informado)
      if (parent_id) {
        const parentPermissao =
          await permissao_services.pegaPermissaoPorId_Services(parent_id);
        if (!parentPermissao) {
          return res
            .status(404)
            .json({ message: "Permissão pai não encontrada" });
        }
      }

      // Atualiza a permissão
      const permissaoAtualizada =
        await permissao_services.atualizaPermissao_Services(id, {
          nome,
          descricao,
          parent_id,
          tipo_permissao_id,
        });

      // Atualiza as roles associadas (se fornecidas)
      if (roleIds && Array.isArray(roleIds)) {
        const roles = await role_services.pegaTodosRole_Services(roleIds);
        await permissao.setRoles(roles);
      }

      return res.status(200).json({
        message: "Permissão atualizada com sucesso",
        permissao: permissaoAtualizada,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message:
          "Erro ao atualizar permissão, contate o administrador do sistema",
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
