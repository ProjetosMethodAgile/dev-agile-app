const Usuario_Services = require("../../services/devagile_services/Usuario_Services");
const Controller = require("../Controller");
const bcrypt = require("bcrypt");
const { devAgile } = require("../../models/index.js");
const camposObrigatorios = [
  "nome",
  "email",
  "senha",
  "contato",
  "roles_id",
  "permissoes",
  "empresa_id",
];

const usuario_services = new Usuario_Services();

class Usuario_Controller extends Controller {
  constructor() {
    super(usuario_services, camposObrigatorios);
  }

  async registerUsuario_Controller(req, res) {
    const { email, permissoes, empresa_id } = req.body;
    const bodyReq = req.body;

    try {
      const isTrue = await this.allowNull(req, res);
      if (!isTrue.status) {
        return res.status(500).json({
          message: "Preencha todos os campos necessários",
          campos: isTrue.campos,
          error: true,
        });
      }

      // Verifica se o usuário já existe
      const userExist = await usuario_services.pegaUsuarioPorEmail_Services(
        email
      );
      if (userExist.status) {
        return res.status(422).json({
          message: "O e-mail informado já está em uso!",
          error: true,
        });
      }

      // Verifica se "permissoes" foi informado corretamente
      if (!permissoes || !Array.isArray(permissoes)) {
        return res.status(400).json({
          message: "Permissões não fornecidas ou inválidas",
          error: true,
        });
      }

      // Valida cada permissão e adiciona as subtelas, se houver
      let permissoesComSubtelas = [];
      for (const perm of permissoes) {
        const tela = await devAgile.Permissao.findByPk(perm.permissao_id, {
          include: [{ model: devAgile.Permissao, as: "subpermissoes" }],
        });

        if (!tela) {
          return res.status(400).json({
            message: `A permissão ${perm.permissao_id} não existe`,
            error: true,
          });
        }

        // Adiciona a permissão principal
        permissoesComSubtelas.push(perm);

        // Se houver subtelas associadas à tela, adiciona-as com os mesmos acessos
        if (tela.subpermissoes.length > 0) {
          tela.subpermissoes.forEach((subtela) => {
            permissoesComSubtelas.push({
              permissao_id: subtela.id,
              acessos: perm.acessos,
              acoes: [], // Aqui você pode definir ações específicas para a subtela, se necessário
            });
          });
        }
      }

      // Valida se a empresa foi informada
      if (!empresa_id) {
        return res
          .status(400)
          .json({ message: "ID da empresa não fornecido", error: true });
      }
      const empresa = await usuario_services.pegaUsuarioPorId_Services(
        empresa_id
      );
      if (!empresa) {
        return res
          .status(404)
          .json({ message: "Empresa não encontrada", error: true });
      }

      // Gera a senha criptografada
      const salt = await bcrypt.genSalt(12);
      const senhaHash = await bcrypt.hash(bodyReq.senha, salt);
      bodyReq.senha = senhaHash;

      // Chama o serviço para registrar o usuário com o novo formato de permissões
      const createUser = await usuario_services.cadastraUsuario_Services(
        bodyReq,
        permissoesComSubtelas
      );
      if (createUser.status) {
        return res.status(200).json({
          message: `Usuário cadastrado e vinculado à empresa com sucesso`,
          error: false,
        });
      } else {
        return res.status(500).json({
          message: createUser.message || "Erro ao cadastrar o usuário",
          error: true,
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Erro ao buscar registro, contate o administrador do sistema",
        error: true,
      });
    }
  }

  // Login do usuário
  async loginUsuario_Controller(req, res) {
    const { email, senha, empresaId, empresaTag } = req.body;
    if (!email)
      return res.status(422).json({ message: "Por favor, insira um email" });
    if (!senha)
      return res.status(422).json({ message: "Por favor, preencha uma senha" });
    if (!empresaId)
      return res.status(422).json({ message: "Informe a empresa" });
    if (!empresaTag)
      return res.status(422).json({ message: "Informe a tag da empresa" });

    // Busca o usuário pelo e-mail, já com as empresas associadas
    const emailExist = await usuario_services.pegaUsuarioPorEmail_Services(
      email
    );
    if (!emailExist.status) {
      return res.status(401).json({
        error: true,
        message: "E-mail ou Senha incorreta",
      });
    }
    const usuario = emailExist.retorno;
    // Verifica se o usuário está vinculado à empresa informada
    if (
      !usuario.empresas ||
      !usuario.empresas.some(
        (empresa) => String(empresa.id) === String(empresaId)
      )
    ) {
      console.log(
        "Usuário empresas:",
        usuario.empresas,
        "EmpresaId:",
        empresaId
      );
      return res
        .status(401)
        .json({ error: true, message: "Usuário não encontrado" });
    }

    // Valida a senha e gera o token, incluindo empresaId e empresaTag
    const checkSenha = await usuario_services.validaSenhaUsuario_Services(
      email,
      senha,
      empresaId,
      empresaTag
    );
    if (!checkSenha.status) {
      return res.status(401).json({
        error: true,
        message: "E-mail ou Senha incorreta",
      });
    }
    return res.status(200).json({
      message: "Autenticação realizada com sucesso",
      token: checkSenha.token,
      error: false,
    });
  }

  async pegaTodosUsuarios_Controller(req, res) {
    try {
      const usuarios = await usuario_services.pegaTodosUsuarios_Services();
      if (!usuarios.status) {
        return res
          .status(400)
          .json({ message: `Nenhum usuário encontrado`, error: true });
      }
      return res.status(200).json(usuarios);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: `Erro ao buscar registros, contate o administrador do sistema`,
      });
    }
  }

  async pegaUsuarioPorId_Controller(req, res) {
    const { id } = req.params;
    try {
      const usuario = await usuario_services.pegaUsuarioPorId_Services(id);
      if (!usuario.status) {
        return res
          .status(400)
          .json({ message: "Usuário não encontrado", error: true });
      }
      return res.status(200).json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao buscar registro, contate o administrador do sistema",
      });
    }
  }

  async atualizaUsuario_Controller(req, res) {
    const { id } = req.params;
    const {
      nome,
      email,
      cargo,
      permissoesCRUD,
      empresa_id,
      colecao,
      clientes,
    } = req.body;

    try {
      // Validação das permissões CRUD
      const invalidPermissoes = permissoesCRUD.some(
        (permissao) =>
          !permissao.permissao_id ||
          typeof permissao.can_create === "undefined" ||
          typeof permissao.can_read === "undefined" ||
          typeof permissao.can_update === "undefined" ||
          typeof permissao.can_delete === "undefined"
      );

      if (invalidPermissoes) {
        return res.status(400).json({
          message:
            "As permissões CRUD fornecidas estão incompletas ou inválidas",
          error: true,
        });
      }

      // Atualiza usuário chamando o serviço
      const result = await usuario_services.atualizaUsuario_Services(id, {
        nome,
        email,
        cargo,
        empresa_id,
        permissoesCRUD,
      });

      console.log(result);

      if (result.status) {
        return res.status(200).json({
          message: "Usuário atualizado com sucesso!",
          error: false,
        });
      } else {
        return res.status(500).json({
          message: result.message || "Erro ao atualizar o usuário",
          error: true,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro no servidor, contate o administrador do sistema",
        error: true,
      });
    }
  }

  async deletaUsuarioPorId_Controller(req, res) {
    const { id } = req.params;

    try {
      const usuario = await usuario_services.deletaUsuarioPorId_Services(id);
      if (usuario === 0) {
        return res
          .status(400)
          .json({ message: `id ${id} não encontrado`, usuario, error: true });
      } else {
        return res
          .status(200)
          .json({ message: `id ${id} deletado`, usuario, error: false });
      }
    } catch (error) {
      return res.status(500).json({
        message: `erro ao buscar registro, contate o administrador do sistema`,
      });
    }
  }
}

module.exports = Usuario_Controller;
