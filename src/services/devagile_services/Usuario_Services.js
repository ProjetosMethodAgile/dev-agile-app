const Services = require("../Services.js");
const { devAgile, sequelizeDevAgileCli } = require("../../models/index.js");
const { Op } = require("sequelize");
const { validate: isUuid } = require("uuid");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class Usuario_Services extends Services {
  async cadastraUsuario_Services(bodyReq, permissoesCRUD) {
    const transaction = await sequelizeDevAgileCli.transaction(); // Inicia a transação

    try {
      // Valida se os role_id são UUIDs válidos
      if (!bodyReq.roles_id.every((id) => isUuid(id))) {
        return { status: false, message: "Informe um cargo válido." };
      }

      // Valida se os permissao_id são UUIDs válidos
      if (!bodyReq.permissoes_id.every((id) => isUuid(id))) {
        return { status: false, message: "Informe uma permissão válida." };
      }

      // Verifica se role_id existe no banco de dados
      const roles = await devAgile.Role.findAll({
        where: {
          id: {
            [Op.in]: bodyReq.roles_id,
          },
        },
        transaction,
      });

      if (roles.length !== bodyReq.roles_id.length) {
        return {
          status: false,
          message: "Uma ou mais roles não foram encontradas.",
        };
      }

      // Verifica se permissao_id existe no banco de dados
      const permissoes = await devAgile.Permissao.findAll({
        where: {
          id: {
            [Op.in]: bodyReq.permissoes_id,
          },
        },
        transaction,
      });

      if (permissoes.length !== bodyReq.permissoes_id.length) {
        return {
          status: false,
          message: "Uma ou mais permissões não foram encontradas.",
        };
      }

      // Verifica se o empresa_id é válido e se existe no banco de dados
      if (!isUuid(bodyReq.empresa_id)) {
        return { status: false, message: "Informe uma empresa válida." };
      }

      const empresa = await devAgile.Empresa.findByPk(bodyReq.empresa_id, {
        transaction,
      });

      if (!empresa) {
        return { status: false, message: "Empresa não encontrada." };
      }

      // Cria o usuário dentro da transação
      const usuario = await devAgile.Usuario.create(
        { id: uuid.v4(), ...bodyReq },
        { transaction }
      );

      if (usuario === null) {
        console.log("usuário não cadastrado");
        await transaction.rollback(); // Faz o rollback caso o usuário não seja criado
        return { status: false };
      }

      // Adiciona roles ao usuário
      await usuario.addUsuario_roles(bodyReq.roles_id, { transaction });

      // Adiciona permissões ao usuário
      await usuario.addUsuario_permissoes(bodyReq.permissoes_id, {
        transaction,
      });

      // Adiciona as permissões CRUD ao usuário
      if (permissoesCRUD && permissoesCRUD.length) {
        for (const permissao of permissoesCRUD) {
          const { permissao_id, can_create, can_read, can_update, can_delete } =
            permissao;

          await devAgile.UserPermissionAccess.create(
            {
              usuario_id: usuario.id,
              permissao_id,
              can_create,
              can_read,
              can_update,
              can_delete,
            },
            { transaction }
          );
        }
      }

      // Vincula o usuário à empresa
      await devAgile.Usuario_Empresa.create(
        {
          usuario_id: usuario.id,
          empresa_id: bodyReq.empresa_id,
        },
        { transaction }
      );

      // Commit na transação se tudo deu certo
      await transaction.commit();
      console.log("usuário cadastrado com sucesso");
      return { status: true };
    } catch (e) {
      await transaction.rollback(); // Faz o rollback caso ocorra qualquer erro
      console.error("Erro na associação", e);
      return { status: false, message: "Erro na associação", error: e.message };
    } finally {
      if (!transaction.finished) await transaction.rollback(); // Assegura que a transação seja finalizada
    }
  }

  async pegaUsuarioPorEmail_Services(email) {
    const retorno = await devAgile.Usuario.findOne({ where: { email: email } });
    if (retorno === null) {
      console.log("email não encontrado na base de dados");
      return { status: false, retorno: retorno };
    } else {
      console.log("email foi encontrado na base de dados");
      return { status: true, retorno: retorno };
    }
  }

  async pegaUsuarioPorId_Services(id) {
    const usuario = await devAgile.Usuario.findOne({
      where: { id: id },
      include: [
        {
          model: devAgile.Role,
          as: "usuario_roles",
          attributes: ["id", "nome", "descricao"],
          through: { attributes: [] }, // Exclui os atributos da tabela de junção
        },
        {
          model: devAgile.Permissao,
          as: "usuario_permissoes",
          attributes: ["id", "nome", "descricao"],
          through: { attributes: [] },
          include: [
            {
              model: devAgile.UserPermissionAccess,
              as: "user_permissions_access",
              attributes: [
                "can_create",
                "can_read",
                "can_update",
                "can_delete",
              ],
              where: { usuario_id: id }, // Filtra para o usuário específico
            },
          ],
        },
      ],
    });
    if (usuario === null) {
      console.log("Registro não encontrado na base de dados");
      return { status: false, usuario: null };
    }

    // Agrupa as permissões por tela usando UserPermissionAccess
    const permissoesPorTela = usuario.usuario_permissoes.reduce(
      (acc, permissao) => {
        const telaNome = permissao.nome; // Usando o nome da permissão como representação da tela

        if (!acc[telaNome]) {
          acc[telaNome] = {
            tela: telaNome,
            permissoes: [],
          };
        }

        // Extraindo permissões CRUD de `user_permissions_access`
        const crudPermissions = permissao.user_permissions_access[0]; // Obtém a entrada CRUD específica
        acc[telaNome].permissoes.push({
          permissao_id: permissao.id,
          can_create: crudPermissions?.can_create || false,
          can_read: crudPermissions?.can_read || false,
          can_update: crudPermissions?.can_update || false,
          can_delete: crudPermissions?.can_delete || false,
        });

        return acc;
      },
      {}
    );

    // Organiza a resposta final com o usuário e permissões agrupadas por tela
    return {
      status: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        contato: usuario.contato,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
        usuario_roles: usuario.usuario_roles,
        usuario_permissoes_por_tela: Object.values(permissoesPorTela),
      },
    };
  }
}

module.exports = Usuario_Services;
