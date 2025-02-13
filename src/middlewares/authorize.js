const { devAgile } = require("../models");
const { Usuario, Role, Permissao, UserPermissionAccess, Empresa } = devAgile;

const methodActionMap = {
  GET: "can_read",
  POST: "can_create",
  PUT: "can_update",
  DELETE: "can_delete",
};

/**
 * Middleware de autorização.
 *
 * @param {string | string[]} requiredPermissions - Permissão ou array de permissões necessárias (ex.: "home_drag" ou ["home_drag", "home_post"]).
 */
function authorize(requiredPermissions) {
  // Permite que seja passado um único valor ou um array
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }

  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const action = methodActionMap[req.method] || "can_read";

      // Carrega o usuário com as associações necessárias
      const user = await Usuario.findByPk(userId, {
        include: [
          {
            model: Role,
            as: "usuario_roles",
            include: [{ model: Permissao, as: "permissoes" }],
          },
          {
            model: UserPermissionAccess,
            as: "user_permissions_access",
            include: [{ model: Permissao, as: "permissao" }],
          },
          { model: Empresa, as: "empresas" },
        ],
      });

      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }

      // Verifica se o usuário possui ao menos uma das permissões explicitamente configuradas
      let hasExplicitPermission = false;
      for (const requiredPermission of requiredPermissions) {
        if (
          user.user_permissions_access &&
          user.user_permissions_access.length > 0
        ) {
          for (const access of user.user_permissions_access) {
            if (
              access.permissao &&
              access.permissao.nome === requiredPermission &&
              access[action]
            ) {
              hasExplicitPermission = true;
              break;
            }
          }
        }
        if (hasExplicitPermission) break;
      }

      if (!hasExplicitPermission) {
        return res
          .status(403)
          .json({ error: "Acesso negado. Permissão explícita insuficiente." });
      }

      // Validação do role: verifica se o usuário possui um role que inclui a(s) permissão(ões)
      let roleAllowsPermission = false;
      for (const requiredPermission of requiredPermissions) {
        if (user.usuario_roles && user.usuario_roles.length > 0) {
          for (const role of user.usuario_roles) {
            if (role.permissoes && role.permissoes.length > 0) {
              if (role.permissoes.find((p) => p.nome === requiredPermission)) {
                roleAllowsPermission = true;
                break;
              }
            }
          }
        }
        if (roleAllowsPermission) break;
      }

      if (!roleAllowsPermission) {
        return res.status(403).json({
          error: "Acesso negado. Papel do usuário não permite essa permissão.",
        });
      }

      // Validação de Empresa (exceto para usuários master)
      const masterRoleId = process.env.MASTER_ROLE_ID;
      const isMaster =
        user.usuario_roles &&
        user.usuario_roles.some((role) => role.id === masterRoleId);

      if (!isMaster && req.user.empresa) {
        const providedEmpresaId = req.params.empresaId || req.body.empresaId;
        if (providedEmpresaId && providedEmpresaId !== req.user.empresa.id) {
          return res.status(403).json({
            error:
              "Acesso negado. Empresa informada difere da empresa do token.",
          });
        }
        if (user.empresas && user.empresas.length > 0) {
          const companyFound = user.empresas.find(
            (e) => e.id === req.user.empresa.id
          );
          if (!companyFound) {
            return res.status(403).json({
              error:
                "Acesso negado. Empresa do token não associada ao usuário.",
            });
          }
        }
      }

      return next();
    } catch (error) {
      console.error("Erro no middleware de autorização:", error);
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  };
}

module.exports = authorize;
