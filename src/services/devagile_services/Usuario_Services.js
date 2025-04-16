const Services = require("../Services.js");
const { devAgile, sequelizeDevAgileCli } = require("../../models/index.js");
const { Op, where } = require("sequelize");
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

  async cadastraUsuario_Services(bodyReq, permissoes) {
    const transaction = await sequelizeDevAgileCli.transaction();
    try {
      // Valida roles
      if (!bodyReq.roles_id.every((id) => isUuid(id))) {
        return { status: false, message: "Informe um cargo válido." };
      }
      // Valida que cada permissão possui um ID válido
      if (!permissoes.every((p) => isUuid(p.permissao_id))) {
        return { status: false, message: "Informe uma permissão válida." };
      }

      // Busca roles associadas
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

      // Busca as permissões (únicas) a partir do array agrupado
      const permissoesIds = [...new Set(permissoes.map((p) => p.permissao_id))];
      const permissoesEncontradas = await devAgile.Permissao.findAll({
        where: { id: { [Op.in]: permissoesIds } },
        transaction,
      });
      if (permissoesEncontradas.length !== permissoesIds.length) {
        return {
          status: false,
          message: "Uma ou mais permissões não foram encontradas.",
        };
      }

      // Valida a empresa
      if (!isUuid(bodyReq.empresa_id)) {
        return { status: false, message: "Informe uma empresa válida." };
      }
      const empresa = await devAgile.Empresa.findByPk(bodyReq.empresa_id, {
        transaction,
      });
      if (!empresa) {
        return { status: false, message: "Empresa não encontrada." };
      }

      // Cria o usuário
      const usuario = await devAgile.Usuario.create(
        { id: uuid.v4(), ...bodyReq },
        { transaction }
      );
      if (!usuario) {
        await transaction.rollback();
        return { status: false, message: "Erro ao cadastrar o usuário" };
      }

      // Associa roles e permissões ao usuário
      await usuario.addUsuario_roles(bodyReq.roles_id, { transaction });
      await usuario.addUsuario_permissoes(permissoesIds, { transaction });

      // Registra os acessos (CRUD) para cada permissão (e suas subtelas)
      if (permissoes && permissoes.length) {
        for (const perm of permissoes) {
          await devAgile.UserPermissionAccess.create(
            {
              usuario_id: usuario.id,
              permissao_id: perm.permissao_id,
              can_create: perm.acessos.can_create,
              can_read: perm.acessos.can_read,
              can_update: perm.acessos.can_update,
              can_delete: perm.acessos.can_delete,
            },
            { transaction }
          );
          // Se houver ações para essa permissão, insere-as
          if (perm.acoes && perm.acoes.length > 0) {
            await devAgile.UserAcaoTela.bulkCreate(
              perm.acoes.map((acao) => ({
                usuario_id: usuario.id,
                acao_tela_id: acao.acao_tela_id,
              })),
              { transaction }
            );
          }
        }
      }

      // Associa o usuário à empresa
      await devAgile.Usuario_Empresa.create(
        { usuario_id: usuario.id, empresa_id: bodyReq.empresa_id },
        { transaction }
      );

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
      where: { id },
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
          attributes: [
            "id",
            "nome",
            "descricao",
            "tipo_permissao_id",
            "parent_id",
          ],
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
            {
              model: devAgile.AcaoTela,
              as: "acoes",
              attributes: ["id", "nome", "descricao"],
            },
          ],
        },
      ],
    });

    if (!usuario) {
      console.log("Registro não encontrado na base de dados");
      return { status: false, usuario: null };
    }

    // IDs fixos dos tipos de permissão
    const TIPO_TELA = process.env.ID_TIPO_TELA;
    const TIPO_SUBTELA = process.env.ID_TIPO_SUB_TELA;

    const todasPermissoes = usuario.usuario_permissoes;

    // Separa as permissões em telas e subtelas
    const permissoesTelas = todasPermissoes.filter(
      (p) => p.tipo_permissao_id === TIPO_TELA
    );
    const permissoesSubTelas = todasPermissoes.filter(
      (p) => p.tipo_permissao_id === TIPO_SUBTELA
    );

    // Função auxiliar para extrair os acessos (CRUD)
    const extrairAcessos = (p) => {
      const crud = p.user_permissions_access && p.user_permissions_access[0];
      return {
        can_create: crud ? crud.can_create : false,
        can_read: crud ? crud.can_read : false,
        can_update: crud ? crud.can_update : false,
        can_delete: crud ? crud.can_delete : false,
      };
    };

    // Função auxiliar para extrair as ações vinculadas a uma permissão
    const extrairAcoes = (p) => {
      return (p.acoes || []).map((acao) => ({
        id: acao.id,
        nome: acao.nome,
        descricao: acao.descricao,
      }));
    };

    // Organiza as permissões, adicionando suas ações e as subtelas
    const permissoesEstruturadas = permissoesTelas.map((tela) => ({
      id: tela.id,
      nome: tela.nome,
      descricao: tela.descricao,
      acessos: extrairAcessos(tela),
      acoes: extrairAcoes(tela),
      subpermissoes: permissoesSubTelas
        .filter((sub) => sub.parent_id === tela.id)
        .map((sub) => ({
          id: sub.id,
          nome: sub.nome,
          descricao: sub.descricao,
          acessos: extrairAcessos(sub),
          acoes: extrairAcoes(sub),
        })),
    }));

    // Monta o objeto final para o front-end
    return {
      status: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        contato: usuario.contato,
        empresa: usuario.empresas,
        usuario_roles: usuario.usuario_roles,
        permissoes: permissoesEstruturadas,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    };
  }

  async pegaUsuariosPorEmpId_Services(id) {
    try {
      const usuarios = await devAgile.Usuario.findAll({
        attributes: [
          "id",
          "nome",
          "email",
          "contato",
          "status",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: devAgile.Empresa,
            as: "empresas",
            attributes: ["id", "nome", "cnpj"],
            through: { attributes: [] },
            where:{id}
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
          status: usuario.status,
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
  
      // 2. Verifique se `permissoesCRUD` foi passado e se contém dados
      if (data.permissoesCRUD && devAgile) {
        let permissoesComSubtelas = [];
  
        // Expandir permissões com subtelas
        for (const perm of data.permissoesCRUD) {
          const tela = await devAgile.Permissao.findByPk(perm.permissao_id, {
            include: [{ model: devAgile.Permissao, as: "subpermissoes" }],
          });
  
          if (!tela) {
            throw new Error(`A permissão ${perm.permissao_id} não existe`);
          }
  
          // Adiciona a permissão principal
          permissoesComSubtelas.push(perm);
  
          // Adiciona as subtelas, caso existam
          if (tela.subpermissoes.length > 0) {
            tela.subpermissoes.forEach((subtela) => {
              permissoesComSubtelas.push({
                permissao_id: subtela.id,
                acessos: perm.acessos,  // Mantém os mesmos acessos da permissão principal
              });
            });
          }
        }
  
        // 3. Deleta permissões anteriores
        await devAgile.UserPermissionAccess.destroy({
          where: { usuario_id: userId },
          transaction,
        });
  
        // 4. Cria as permissões com subtelas no banco
        await devAgile.UserPermissionAccess.bulkCreate(
          permissoesComSubtelas.map((perm) => ({
            usuario_id: userId,
            permissao_id: perm.permissao_id,
            can_create: perm.acessos.can_create,
            can_read: perm.acessos.can_read,
            can_update: perm.acessos.can_update,
            can_delete: perm.acessos.can_delete,
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
      return { status: false, message: error.message || "Erro ao atualizar usuário" };
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
