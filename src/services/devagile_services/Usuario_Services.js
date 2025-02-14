const Services = require("../Services.js");
const { devAgile, sequelizeDevAgileCli } = require("../../models/index.js");
const { Op } = require("sequelize");
const { validate: isUuid } = require("uuid");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class Usuario_Services extends Services {
  async pegaTodosUsuarios_Services() {
    try {
      const usuarios = await devAgile.Usuario.findAll({
        attributes: [
          "id",
          "nome",
          "email",
          "contato",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: devAgile.Empresa,
            as: "empresas",
            attributes: ["id", "nome", "cnpj"],
            through: { attributes: [] },
          },
          {
            model: devAgile.Role,
            as: "usuario_roles",
            attributes: ["id", "nome", "descricao"],
            through: { attributes: [] },
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
              },
            ],
          },

          {
            model: devAgile.UserAcaoTela,
            as: "user_acoes_tela",
            include: [
              {
                model: devAgile.AcaoTela,
                as: "acao_tela",
                attributes: ["id", "nome", "descricao"],
              },
            ],
          },
        ],
      });

      if (!usuarios.length) {
        return { status: false, usuarios: [] };
      }

      // Formata cada usuário
      const formattedUsuarios = usuarios.map((usuario) => {
        const permissoesPorTela = usuario.usuario_permissoes.reduce(
          (acc, permissao) => {
            const telaNome = permissao.nome;
            if (!acc[telaNome]) {
              acc[telaNome] = {
                tela: telaNome,
                permissoes: [],
              };
            }
            const crudPermissions = permissao.user_permissions_access[0];
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

        // Extrai as ações unitárias (por exemplo, apenas os IDs)
        const acoesTela = usuario.user_acoes_tela.map(
          (registro) => registro.acao_tela.id
        );

        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          contato: usuario.contato,
          empresa: usuario.empresas,
          usuario_roles: usuario.usuario_roles,
          usuario_permissoes_por_tela: Object.values(permissoesPorTela),
          acoesTela, // Retorna os IDs das ações unitárias vinculadas
          createdAt: usuario.createdAt,
          updatedAt: usuario.updatedAt,
        };
      });

      return { status: true, usuarios: formattedUsuarios };
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao buscar usuários");
    }
  }

  async cadastraUsuario_Services(bodyReq, permissoesCRUD) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // Valida se os role_id e permissao_id são válidos
      if (!bodyReq.roles_id.every((id) => isUuid(id))) {
        return { status: false, message: "Informe um cargo válido." };
      }
      if (!bodyReq.permissoes_id.every((id) => isUuid(id))) {
        return { status: false, message: "Informe uma permissão válida." };
      }

      // Verifica se as roles existem
      const roles = await devAgile.Role.findAll({
        where: { id: { [Op.in]: bodyReq.roles_id } },
        transaction,
      });
      if (roles.length !== bodyReq.roles_id.length) {
        return {
          status: false,
          message: "Uma ou mais roles não foram encontradas.",
        };
      }

      // Verifica se as permissões (telas) existem
      const permissoes = await devAgile.Permissao.findAll({
        where: { id: { [Op.in]: bodyReq.permissoes_id } },
        transaction,
      });
      if (permissoes.length !== bodyReq.permissoes_id.length) {
        return {
          status: false,
          message: "Uma ou mais permissões não foram encontradas.",
        };
      }

      // Verifica a existência da empresa
      if (!isUuid(bodyReq.empresa_id)) {
        return { status: false, message: "Informe uma empresa válida." };
      }
      const empresa = await devAgile.Empresa.findByPk(bodyReq.empresa_id, {
        transaction,
      });
      if (!empresa) {
        return { status: false, message: "Empresa não encontrada." };
      }

      // Cria o usuário (com id gerado via uuid.v4() e demais dados)
      const usuario = await devAgile.Usuario.create(
        { id: uuid.v4(), ...bodyReq },
        { transaction }
      );
      if (!usuario) {
        await transaction.rollback();
        return { status: false, message: "Erro ao cadastrar o usuário" };
      }

      // Associa roles ao usuário
      await usuario.addUsuario_roles(bodyReq.roles_id, { transaction });
      // Associa permissões (telas) ao usuário
      await usuario.addUsuario_permissoes(bodyReq.permissoes_id, {
        transaction,
      });

      // Cria as permissões CRUD para a tela (UserPermissionAccess)
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
        { usuario_id: usuario.id, empresa_id: bodyReq.empresa_id },
        { transaction }
      );

      // NOVO: Vincula as ações unitárias (UserAcaoTela) se fornecidas no body.
      // Suponha que o corpo da requisição contenha um array "acoesTela",
      // onde cada objeto possui ao menos a propriedade "acao_tela_id".
      if (
        bodyReq.acoesTela &&
        Array.isArray(bodyReq.acoesTela) &&
        bodyReq.acoesTela.length > 0
      ) {
        await devAgile.UserAcaoTela.bulkCreate(
          bodyReq.acoesTela.map((acao) => ({
            usuario_id: usuario.id,
            acao_tela_id: acao.acao_tela_id, // Certifique-se de que esse campo está presente no objeto
          })),
          { transaction }
        );
      }

      // Commit na transação se tudo der certo
      await transaction.commit();
      return { status: true };
    } catch (e) {
      await transaction.rollback();
      console.error("Erro na associação", e);
      return { status: false, message: "Erro na associação", error: e.message };
    } finally {
      if (!transaction.finished) await transaction.rollback();
    }
  }

  async pegaUsuarioPorEmail_Services(email) {
    const retorno = await devAgile.Usuario.findOne({
      where: { email },
      include: [
        {
          model: devAgile.Empresa,
          as: "empresas",
          attributes: [
            "id",
            "nome",
            "cnpj",
            "tag",
            "logo",
            "cor_primaria",
            "cor_secundaria",
          ],
          through: { attributes: [] },
        },
        {
          model: devAgile.Role,
          as: "usuario_roles",
          attributes: ["id", "nome", "descricao"],
          through: { attributes: [] },
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
            },
          ],
        },
        {
          model: devAgile.UserAcaoTela,
          as: "user_acoes_tela",
          include: [
            {
              model: devAgile.AcaoTela,
              as: "acao_tela",
              attributes: ["id", "nome", "descricao"],
            },
          ],
        },
      ],
    });

    if (!retorno) {
      console.log("Email não encontrado na base de dados");
      return { status: false, retorno: null };
    } else {
      // Converte a instância para um objeto plain
      const user = retorno.get({ plain: true });
      console.log("Email foi encontrado na base de dados", user);
      return { status: true, retorno: user };
    }
  }

  async pegaUsuarioPorId_Services(id) {
    const usuario = await devAgile.Usuario.findOne({
      where: { id: id },
      include: [
        {
          model: devAgile.Empresa,
          as: "empresas",
          attributes: [
            "id",
            "nome",
            "cnpj",
            "tag",
            "logo",
            "cor_primaria",
            "cor_secundaria",
          ],
          through: { attributes: [] },
        },
        {
          model: devAgile.Role,
          as: "usuario_roles",
          attributes: ["id", "nome", "descricao"],
          through: { attributes: [] },
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
              where: { usuario_id: id },
            },
          ],
        },
        {
          model: devAgile.UserAcaoTela,
          as: "user_acoes_tela",
          include: [
            {
              model: devAgile.AcaoTela,
              as: "acao_tela",
              attributes: ["id", "nome", "descricao"],
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
        const telaNome = permissao.nome;
        if (!acc[telaNome]) {
          acc[telaNome] = {
            tela: telaNome,
            permissoes: [],
          };
        }
        const crudPermissions = permissao.user_permissions_access[0];
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

    // Formata o array de ações unitárias, extraindo por exemplo apenas os IDs da ação
    const acoesTela = usuario.user_acoes_tela.map(
      (registro) => registro.acao_tela.id
    );

    // Organiza a resposta final
    return {
      status: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        contato: usuario.contato,
        empresa: usuario.empresas,
        usuario_roles: usuario.usuario_roles,
        usuario_permissoes_por_tela: Object.values(permissoesPorTela),
        acoesTela, // Retorna os IDs das ações unitárias vinculadas
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    };
  }

  async atualizaUsuario_Services(userId, data) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // 1. Atualizar dados básicos do usuário
      await devAgile.Usuario.update(
        {
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
          empresa_id: data.empresa_id,
        },
        { where: { id: userId }, transaction }
      );

      // 2. Atualizar permissões CRUD
      if (data.permissoesCRUD) {
        // Verifique se `usuarios_permissoes` está importado diretamente do `models/index.js`
        await devAgile.usuarios_permissoes.destroy({
          where: { usuario_id: userId },
          transaction,
        });

        await devAgile.usuarios_permissoes.bulkCreate(
          data.permissoesCRUD.map((perm) => ({
            usuario_id: userId,
            permissao_id: perm.permissao_id,
            can_create: perm.can_create,
            can_read: perm.can_read,
            can_update: perm.can_update,
            can_delete: perm.can_delete,
          })),
          { transaction }
        );
      }

      // Commit da transação
      await transaction.commit();
      return { status: true };
    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao atualizar usuário:", error);
      return { status: false, message: "Erro ao atualizar usuário" };
    }
  }

  async deletaUsuarioPorId_Services(id) {
    return devAgile.Usuario.destroy({ where: { id: id } });
  }

  async validaSenhaUsuario_Services(email, senha, empresaId, empresaTag) {
    const retorno = await devAgile.Usuario.findAll({
      attributes: ["id", "nome", "email"],
      where: { email: email },
    });
    if (retorno === null || retorno.length === 0) {
      console.log("E-mail não encontrado na base de dados");
      return { status: false, message: "Usuário ou senha incorreto!" };
    }

    // Busca a senha armazenada
    const pwd = await devAgile.Usuario.findAll({
      attributes: ["senha"],
      where: { email: email },
    });
    const senhaDB = pwd[0].dataValues.senha;
    const checkSenha = await bcrypt.compare(senha, senhaDB);
    if (!checkSenha)
      return { status: false, message: "Usuário ou senha incorreto!" };

    try {
      const secret = process.env.SECRET_LOGIN;
      const TokenExpirationTime = "1d";
      const token = jwt.sign(
        {
          id: retorno[0].dataValues.id,
          empresa: {
            id: empresaId, // ID da empresa escolhida no login
            tag: empresaTag, // Tag da empresa escolhida no login
          },
        },
        secret,
        { expiresIn: TokenExpirationTime }
      );

      return {
        message: "Autenticação realizada com sucesso",
        token,
        status: true,
      };
    } catch (e) {
      console.log(e);
      return { status: false, error: e.message };
    }
  }
}

module.exports = Usuario_Services;
