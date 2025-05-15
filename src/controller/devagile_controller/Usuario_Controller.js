const Usuario_Services = require("../../services/devagile_services/Usuario_Services");
const Controller = require("../Controller");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { sendEmailRaw } = require("../../utils/sendEmailRaw.js");
const { devAgile } = require("../../models/index.js");
const Empresa_Services = require("../../services/devagile_services/Empresa_Services.js");
const e = require("cors");
const camposObrigatorios = [
  "nome",
  "email",
  "contato",
  "roles_id",
  "permissoes",
  "empresa_id",
];

const usuario_services = new Usuario_Services();
const empresa_services = new Empresa_Services();

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

      //Pega a empresa pelo id e recupera a tagName
      const { tag } = await empresa_services.pegaEmpresaPorId_Services(
        empresa_id
      );

      // Função para gerar uma senha aleatória de 8 caracteres alfabeticos
      const createRandomPassword = () => {
        const caracteres =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let senha = "";
        for (let i = 0; i < 6; i++) {
          const randomIndex = Math.floor(Math.random() * caracteres.length);
          senha += caracteres[randomIndex];
        }
        return senha;
      };

      // Gera a senha aleatória
      const senhaGerada = createRandomPassword();

      //Pega template de email e substitui as variaveis
      const templatePath = path.join(
        __dirname,
        "..",
        "..",
        "utils",
        "templates",
        "email",
        "new-user-password.html"
      );
      const htmlTemplate = fs.readFileSync(templatePath, "utf8");
      const htmlContent = htmlTemplate
        .replace("{{NOME_USUARIO}}", bodyReq.nome)
        .replace("{{SENHA_TEMPORARIA}}", senhaGerada)
        .replace("{{TAG_EMPRESA}}", tag);

      // envia o email com a senha criptografadas
      const mail = await sendEmailRaw({
        from: [process.env.EMAIL_PRINCIPAL],
        to: email,
        subject: "Cadastro de Usuário",
        html: htmlContent,
      });
      console.log(mail);

      // Gera a senha criptografada
      const salt = await bcrypt.genSalt(12);
      const senhaHash = await bcrypt.hash(senhaGerada, salt);
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

  async resetaSenhaUsuario_Controller(req, res) {
    const { email, empresa_id } = req.body;
    const { id } = req.params;
    const bodyReq = req.body;

    try {
      // Verifica se o usuário existe
      const userExist = await usuario_services.pegaUsuarioPorEmail_Services(
        email
      );
      console.log("teste:", userExist);

      if (!userExist.status) {
        return res.status(422).json({
          message: "O usuario não existe",
          error: true,
        });
      }

      //Pega a empresa pelo id e recupera a tagName
      const { tag } = await empresa_services.pegaEmpresaPorId_Services(
        empresa_id
      );

      // Função para gerar uma senha aleatória de 8 caracteres alfabeticos
      const createRandomPassword = () => {
        const caracteres =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let senha = "";
        for (let i = 0; i < 6; i++) {
          const randomIndex = Math.floor(Math.random() * caracteres.length);
          senha += caracteres[randomIndex];
        }
        return senha;
      };

      // Gera a senha aleatória
      const senhaGerada = createRandomPassword();

      //Pega template de email e substitui as variaveis
      const templatePath = path.join(
        __dirname,
        "..",
        "..",
        "utils",
        "templates",
        "email",
        "reset-password.html"
      );
      const htmlTemplate = fs.readFileSync(templatePath, "utf8");
      const htmlContent = htmlTemplate
        .replace("{{NOME_USUARIO}}", userExist.retorno.nome)
        .replace("{{SENHA_TEMPORARIA}}", senhaGerada)
        .replace("{{TAG_EMPRESA}}", tag)
        .replace("{{EMPRESA_URL}}", process.env.EMPRESA_URL);

      // envia o email com a senha criptografadas
      const mail = await sendEmailRaw({
        from: [process.env.EMAIL_PRINCIPAL],
        to: email,
        subject: "Redefinição de senha DevAgile",
        html: htmlContent,
      });
      console.log(mail);

      // Gera a senha criptografada
      const salt = await bcrypt.genSalt(12);
      const senhaHash = await bcrypt.hash(senhaGerada, salt);
      bodyReq.senha = senhaHash;

      const updateUser = await usuario_services.atualizaUsuario_Services(
        id,
        bodyReq
      );

      if (updateUser.status) {
        return res.status(200).json({
          message: `Senha redefinida com sucesso`,
          error: false,
        });
      } else {
        return res.status(500).json({
          message: updateUser.message || "Erro ao redefinir a senha",
          error: true,
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message:
          "Erro completar solicitação, contate o administrador do sistema",
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
      primeiroAcesso: usuario.primeiro_acesso,
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

  async pegaUsuariosPorEmpId_Controller(req, res) {
    const { id } = req.params;
    try {
      const usuario = await usuario_services.pegaUsuariosPorEmpId_Services(id);
      if (!usuario.status) {
        return res.status(400).json({
          message: "Usuários não encontrado nesta empresa",
          error: true,
        });
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
    let {
      nome,
      email,
      status,
      roles_id,
      contato,
      permissoesCRUD,
      senha,
      primeiro_acesso,
    } = req.body;

    try {
      // Se permissoesCRUD for definido, deve ser um array válido
      if (typeof permissoesCRUD !== "undefined") {
        if (!Array.isArray(permissoesCRUD)) {
          return res.status(400).json({
            message: "permissoesCRUD deve ser um array válido",
            error: true,
          });
        }

        const invalidPermissoes = permissoesCRUD.some((permissao) => {
          return (
            !permissao.permissao_id ||
            typeof permissao.acessos.can_create === "undefined" ||
            typeof permissao.acessos.can_read === "undefined" ||
            typeof permissao.acessos.can_update === "undefined" ||
            typeof permissao.acessos.can_delete === "undefined"
          );
        });

        if (invalidPermissoes) {
          return res.status(400).json({
            message:
              "As permissões CRUD fornecidas estão incompletas ou inválidas",
            error: true,
          });
        }
      }

      if (senha) {
        const salt = await bcrypt.genSalt(12);
        senha = await bcrypt.hash(senha, salt);
      }

      // Monta o objeto de dados para enviar ao service
      const dataToUpdate = {
        nome,
        email,
        contato,
        status,
        senha,
        roles_id,
        primeiro_acesso,
      };

      if (typeof permissoesCRUD !== "undefined") {
        dataToUpdate.permissoesCRUD = permissoesCRUD;
      }

      const result = await usuario_services.atualizaUsuario_Services(
        id,
        dataToUpdate
      );

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
