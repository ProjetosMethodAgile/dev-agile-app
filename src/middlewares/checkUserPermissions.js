const jwt = require('jsonwebtoken');
const usuario_services = require('../src/services/amfcli_services/Usuario_Services.js');

async function checkUserPermissions(requiredRoles = [], requiredCrudAccess = [], requiredPermission = '') {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Acesso negado", error: true });
    }

    try {
      const secret = process.env.SECRET_LOGIN;
      const decodedToken = jwt.verify(token, secret);
      const userId = decodedToken.id;

      // Busca as permissões do usuário
      const usuarioData = await usuario_services.pegaUsuarioPorId_Services(userId);
      if (!usuarioData.status) {
        return res.status(404).json({ message: "Usuário não encontrado", error: true });
      }

      const { usuario_roles, usuario_permissoes_por_tela } = usuarioData.usuario;
      
      // Verifica se o usuário tem pelo menos uma das roles necessárias
      const hasRoleAccess = usuario_roles.some(role => requiredRoles.includes(role.nome));
      if (!hasRoleAccess) {
        return res.status(403).json({ message: "Acesso negado. Role não autorizada.", error: true });
      }

      // Verifica se o usuário tem permissão para a tela e os acessos CRUD necessários
      const telaPermissao = usuario_permissoes_por_tela.find(tela => tela.tela === requiredPermission);
      console.log(usuario_permissoes_por_tela);
      
      if (!telaPermissao) {
        return res.status(403).json({ message: "Acesso negado à tela", error: true });
      }

      // Verifica se o usuário tem pelo menos uma das permissões CRUD necessárias
      const hasCrudAccess = telaPermissao.permissoes.some(permissao =>
        requiredCrudAccess.some(crud => permissao[crud])
      );
      if (!hasCrudAccess) {
        return res.status(403).json({ message: `Permissões ${requiredCrudAccess.join(', ')} negadas`, error: true });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Token inválido", error: true });
    }
  };
}

module.exports = checkUserPermissions;
