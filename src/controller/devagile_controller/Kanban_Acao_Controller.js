const kanban_Acao_Services = require("../../services/devagile_services/kanban_Acao_Services.js");
const Empresa_Services = require("../../services/devagile_services/Empresa_Services.js");
const Controller = require("../Controller.js");
const { devAgile } = require("../../models");
const KanbanCards_Services = require("../../services/devagile_services/kanbanCards_Services.js");
const { sendEmailRaw } = require("../../utils/sendEmailRaw.js");
const ws = require("../../websocket.js");

const kanban_acao_services = new kanban_Acao_Services();
const camposObrigatorios = ["nome", "empID", "descricao"]; // a ação precisa estar vinculada a uma tela (permissao)
const empresa_service = new Empresa_Services();
const kanbanCardsService = new KanbanCards_Services();

class Kanban_Acao_Controller extends Controller {
  constructor() {
    super(kanban_acao_services, camposObrigatorios);
  }

  async criaAcaoKanban_controller(req, res) {
    const data = req.body;
    if (!data.nome || !data.descricao || !data.empID) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }
    try {
      const acao = await kanban_acao_services.criaAcaoKanban_Services(data);
      if (!acao.error) {
        console.log(acao);
        return res
          .status(200)
          .json({ message: `Cadastro da ação realizada com sucesso` });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao cadastrar Acao" });
    }
  }

  async vinculaAcaoNaColunaPorID_controller(req, res) {
    const data = req.body;
    if (!data.id_column || !data.id_acao) {
      return res.status(400).json({ message: "id não informado" });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(data.id_column)) {
      return res.status(400).json({ message: "UUID coluna inválido" });
    }
    if (!uuidRegex.test(data.id_acao)) {
      return res.status(400).json({ message: "UUID acao inválido" });
    }

    const validaAcaoCadastrada = await kanban_acao_services.validaAcaoID(
      data.id_acao
    );
    if (!validaAcaoCadastrada) {
      return res.status(400).json({ message: "UUID não cadastrado" });
    }

    try {
      const acao = await kanban_acao_services.vinculaAcaoKanban_Services(data);
      if (!acao.error) {
        console.log(acao);
        return res
          .status(200)
          .json({ message: `Vinculo da ação realizada com sucesso` });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao vincular Acao" });
    }
  }

  async pegaTodosKanban_Acao_Controller(req, res) {
    try {
      const lista = await kanban_acao_services.pegaTodoskanban_Acao_Services();
      return res.status(200).json(lista);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao buscar registros" });
    }
  }

  async pegaTodosAcaoPorEmpresa_Controller(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Erro ao buscar registros" });
      }
      const empresa = await empresa_service.pegaEmpresaPorId_Services(id);

      if (!empresa) {
        return res.status(400).json({ message: "Erro ao buscar registros" });
      }
      const lista = await kanban_acao_services.pegaTodosAcaoEmpresa_Services(
        empresa.id
      );

      return res.status(200).json(lista);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao buscar registros" });
    }
  }

  async sendEmailPorChangeColumn_Controller(req, res) {
    const { card_id, column_nome } = req.body;
    const sessao = await devAgile.KanbanSessoes.findOne({ where: { card_id } });
    if (sessao) {
      const ultimaMessage = await devAgile.KanbanSessoesMessages.findOne({
        where: { sessao_id: sessao.id },
        order: [["createdAt", "DESC"]],
      });
      if (!ultimaMessage) {
        return res.status(404).json({
          error: true,
          message: "Mensagem original não encontrada",
        });
      }

      const originalSubject = ultimaMessage.subject.trim();
      const emailSubjectUser = originalSubject.toLowerCase().startsWith("re:")
        ? originalSubject
        : `Re: ${originalSubject}`;

      // Obtém o valor de cc vindo de originalMsg ou da variável cc_email
      let ccEmails = ultimaMessage.cc_email;
      let toEmails = ultimaMessage.to_email;

      // Verifica se há algum conteúdo na variável
      const mainEmail = process.env.MAIN_EMAIL;
      if (ccEmails) {
        // Separa os emails usando a vírgula como delimitador, remove espaços em branco
        // e filtra para remover o email principal (comparando em caixa baixa para garantir a igualdade)
        ccEmails = ccEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.toLowerCase() !== mainEmail.toLowerCase())
          .join(", ");

        // Caso a filtragem resulte em uma string vazia, ajusta a variável para undefined
        if (!ccEmails) {
          ccEmails = undefined;
        }
      }
      if (toEmails) {
        // Separa os emails usando a vírgula como delimitador, remove espaços em branco
        // e filtra para remover o email principal (comparando em caixa baixa para garantir a igualdade)
        toEmails = toEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.toLowerCase() !== mainEmail.toLowerCase())
          .join(", ");

        // Caso a filtragem resulte em uma string vazia, ajusta a variável para o email do cliente que abriu o card
        if (!toEmails) {
          const primeiraMessage = await devAgile.KanbanSessoesMessages.findOne({
            where: { sessao_id: sessao.id },
            order: [["createdAt", "ASC"]],
          });
          if (primeiraMessage) {
            toEmails = primeiraMessage.to_email;
          } else {
            toEmails = undefined;
          }
        }
      }

      const TextBody = `Notificação do Sistema: \n\n Seu card mudou de situação para ${column_nome}`;
      if (toEmails) {
        const emailToUsrResponse = await sendEmailRaw({
          to: toEmails, // destinatário é o email do usuário que abriu o chamado
          cc: ccEmails,
          subject: emailSubjectUser,
          text: TextBody,
          inReplyTo: ultimaMessage.message_id,
          references: ultimaMessage.references_email,
        });

        //pegando id da message enviada por email para o usuario e concatenando com o dominio do AWS SES para a validação na lambda comparar e atribuir os valores
        const messageId = emailToUsrResponse.MessageId;
        const formattedMessageId = `<${messageId}@sa-east-1.amazonses.com>`;

        // let atendente_id = "";
        // let cliente_id = "";
        // let from_email = "";
        // 2. Cria a nova mensagem, vinculando-a à mensagem original
        const newMessage = await kanbanCardsService.replyMessage_Services({
          originalMsg: ultimaMessage, // dados da menssagem respondida
          textBody: TextBody, //corpo do email
          // atendente_id,
          // cliente_id,
          message_id: formattedMessageId, // repassa o message id do email que foi enviado, se existir
          inReplyTo: ultimaMessage.message_id,
          // from_email,
          // htmlBody,
          to_email: ultimaMessage.to_email,
          cc_email: ultimaMessage.cc_email,
          // bcc_email,
          subject: emailSubjectUser,
          references: ultimaMessage.references_email,
          system_msg: true,
        });
        ws.broadcast({
          type: `cardUpdated-${card_id}`,
          message: "atendente vinculado ao card",
        });
      } else {
        return res.status(404).json({
          error: true,
          message: "Não foi possivel enviar email / menssagem",
        });
      }
      return res.status(200).json(ultimaMessage);
    }
  }
}

module.exports = Kanban_Acao_Controller;
