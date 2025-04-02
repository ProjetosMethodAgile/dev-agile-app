const { devAgile } = require("../../models");
const KanbanCards_Services = require("../../services/devagile_services/kanbanCards_Services");
const KanbanSetores_Services = require("../../services/devagile_services/kanbanSetores_Services");
const Usuario_Services = require("../../services/devagile_services/Usuario_Services");
const { sendEmailRaw } = require("../../utils/sendEmailRaw");
const Controller = require("../Controller");

const kanbanCardsService = new KanbanCards_Services();
const usuarioServices = new Usuario_Services();
const kanbanSetoresService = new KanbanSetores_Services();
const camposObrigatorios = [
  "setor_id",
  "src_img_capa",
  "titulo_chamado",
  "status",
  "descricao",
];

class KanbanCards_Controller extends Controller {
  constructor() {
    super(kanbanCardsService, camposObrigatorios);
  }

  // Método para cadastro de card sem usuário autenticado (fluxo já existente)
  async cadastraCard_Controller(req, res) {
    try {
      const { setor_id, src_img_capa, titulo_chamado, status, descricao } =
        req.body;
      const isTrue = await this.allowNull(req, res);
      if (!isTrue.status) {
        return res.status(500).json({
          message: "Preencha todos os campos necessários",
          campos: isTrue.campos,
          error: true,
        });
      }
      const setorResult = await kanbanSetoresService.pegaSetorPorId_Services(
        setor_id
      );
      if (!setorResult || !setorResult.setor) {
        return res.status(404).json({
          message: "Setor não encontrado",
          error: true,
        });
      }
      const setor = setorResult.setor;
      const column = await devAgile.KanbanComlumns.findOne({
        where: { setor_id, posicao: "0" },
      });
      if (!column) {
        return res.status(404).json({
          message: "Coluna de posição 0 não encontrada para o setor informado",
          error: true,
        });
      }
      const result = await kanbanCardsService.cadastraCard_Services(
        column.id,
        src_img_capa,
        titulo_chamado,
        status,
        descricao,
        setor_id
      );
      if (result.error) {
        return res.status(404).json({
          message: result.message,
          error: true,
        });
      }
      // Envio de email com header customizado e atualização do registro
      if (user_email && isValidEmail(user_email)) {
        // Gere o Message-ID a partir do id já gerado (result.createdMessage.id)

        const messageId = result.createdMessage.id;

        try {
          // Envia o email definindo tanto o header customizado quanto o Message-ID padrão
          const emailToSetorResponse = await sendEmailRaw({
            to: [setor.email_setor, process.env.MAIN_EMAIL],
            subject: `Novo ${titulo_chamado} Setor - ${setor.nome}`,
            text: `Um novo card foi criado no setor ${setor.nome}.\n\nDescrição: ${descricao}`,
            customHeaders: {
              "message-id-db": messageId,
            },
          });
          console.log("Email enviado. SES response:", emailToSetorResponse);
        } catch (emailError) {
          console.error("Erro ao enviar email via SES:", emailError);
        }
      } else {
        return res.status(200).json({
          card: result.card,
          message: "E-mail não enviado",
          error: false,
        });
      }
      return res.status(200).json({
        card: result.card,
        message: result.message,
        error: false,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // método para cadastro com usuário autenticado
  async cadastraCardAuth_Controller(req, res) {
    try {
      const {
        setor_id,
        src_img_capa,
        titulo_chamado,
        status,
        descricao,
        usuario_id,
      } = req.body;
      const usuario = await usuarioServices.pegaUsuarioPorId_Services(
        usuario_id
      );
      const user_email = usuario.usuario.email;
      if (!usuario_id || !user_email) {
        return res.status(400).json({
          error: true,
          message: "Usuário não autenticado ou sem email.",
        });
      }
      const isTrue = await this.allowNull(req, res);
      if (!isTrue.status) {
        return res.status(500).json({
          message: "Preencha todos os campos necessários",
          campos: isTrue.campos,
          error: true,
        });
      }
      const setorResult = await kanbanSetoresService.pegaSetorPorId_Services(
        setor_id
      );
      if (!setorResult || !setorResult.setor) {
        return res.status(404).json({
          message: "Setor não encontrado",
          error: true,
        });
      }
      const setor = setorResult.setor;
      const column = await devAgile.KanbanComlumns.findOne({
        where: { setor_id, posicao: "0" },
      });
      if (!column) {
        return res.status(404).json({
          message: "Coluna de posição 0 não encontrada para o setor informado",
          error: true,
        });
      }
      const result = await kanbanCardsService.cadastraCardAuth_Services(
        column.id,
        src_img_capa,
        titulo_chamado,
        status,
        descricao,
        setor_id,
        usuario_id
      );
      if (result.error) {
        return res.status(404).json({
          message: result.message,
          error: true,
        });
      }
      // Envio de email com header customizado e atualização do registro
      if (user_email && isValidEmail(user_email)) {
        // Gere o Message-ID a partir do id já gerado (result.createdMessage.id)
        const messageId = result.createdMessage.id;
        try {
          // Envia o email definindo tanto o header customizado quanto o Message-ID padrão
          const emailToSetorResponse = await sendEmailRaw({
            to: [setor.email_setor, process.env.MAIN_EMAIL],
            subject: `Novo ${titulo_chamado} Setor - ${setor.nome}`,
            text: `Um novo card foi criado no setor ${setor.nome}.\n\nDescrição: ${descricao}`,
            customHeaders: {
              "message-id-db": messageId,
            },
          });
          console.log("Email enviado. SES response:", emailToSetorResponse);
          const emailToUsrResponse = await sendEmailRaw({
            to: user_email,
            cc: [process.env.MAIN_EMAIL],
            subject: `Recebemos seu ${titulo_chamado}`,
            text: `Olá ${usuario.usuario.nome}!\n\n.Logo um atendente entrara em contato com voce. ${setor.nome}.\n\nSeu chamado:: ${descricao}`,
            customHeaders: {
              "message-id-db": messageId,
            },
          });
          console.log("Email enviado. SES response:", emailToUsrResponse);
        } catch (emailError) {
          console.error("Erro ao enviar email via SES:", emailError);
        }
      } else {
        return res.status(200).json({
          card: result.card,
          message: "E-mail não enviado",
          error: false,
        });
      }

      return res.status(200).json({
        card: result.card,
        message: result.message,
        error: false,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Método para atualizar os dados do email (rota consumida pela Lambda)
  async atualizaEmailData_Controller(req, res) {
    try {
      // Payload esperado: {id, message_id, from_email, to_email, cc_email, bcc_email, subject, textBody, htmlBody, isReply }
      const {
        id,
        message_id,
        from_email,
        to_email,
        cc_email,
        bcc_email,
        subject,
        textBody,
        htmlBody,
        isReply,
      } = req.body;
      if (!message_id) {
        return res.status(400).json({
          error: true,
          message: "message_id é obrigatório",
        });
      }
      // Atualiza os dados do email usando o serviço, buscando pelo id do registro
      const result = await kanbanCardsService.atualizaEmailData_Services(id, {
        message_id,
        from_email,
        to_email,
        cc_email,
        bcc_email,
        subject,
        textBody: textBody,
        htmlBody,
        isReply,
      });
      if (result.error) {
        return res.status(400).json({ error: true, message: result.message });
      }
      return res.status(200).json({
        error: false,
        message: result.message,
        updatedMessage: result.updatedMessage,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async replyMessage_Controller(req, res) {
    try {
      // Agora esperamos também message_id no payload (opcional)
      const { inReplyTo, textBody, message_id } = req.body;
      if (!message_id || !textBody) {
        return res.status(400).json({
          error: true,
          message:
            "Dados insuficientes (message_id e textBody são obrigatórios).",
        });
      }

      // 1. Localiza a mensagem original (usando o identificador que o sistema utiliza, por exemplo, o id gravado no DB)
      const originalMsg = await kanbanCardsService.pegaMensagemPorId_Services(
        inReplyTo
      );
      if (!originalMsg) {
        return res.status(404).json({
          error: true,
          message: "Mensagem original não encontrada",
        });
      }
      const cliente_id = originalMsg.cliente_id;
      const atendente_id = originalMsg.atendente_id;

      // 2. Cria a nova mensagem, vinculando-a à mensagem original
      const newMessage = await kanbanCardsService.replyMessage_Services({
        originalMsg, // dados da menssagem respondida
        textBody, //corpo do email
        atendente_id,
        cliente_id,
        message_id, // repassa o message id do email que foi enviado, se existir
      });

      if (newMessage.error) {
        return res
          .status(400)
          .json({ error: true, message: newMessage.message });
      }

      // 3. Envia notificação por email
      // Se for resposta do atendente (no sistema), envia para o usuário
      // Caso contrário, se for resposta do usuário, envia para o atendente/sector
      if (atendente_id) {
        await sendEmailRaw({
          to: originalMsg.from_email, // destinatário é o email do usuário que abriu o chamado
          subject: `Re: Chamado #${originalMsg.sessao_id}`,
          text: `Atendente respondeu: ${textBody}`,
          inReplyTo: originalMsg.message_id,
          references: `<${originalMsg.message_id}>`,
          customHeaders: {
            "X-MyApp-MessageId": newMessage.data.id,
          },
        });
      } else {
        await sendEmailRaw({
          to: originalMsg.from_email, // destinatário é o email do setor ou do atendente
          subject: `Re: Chamado #${originalMsg.sessao_id}`,
          text: `Usuário respondeu: ${textBody}`,
          inReplyTo: originalMsg.message_id,
          references: `<${originalMsg.message_id}>`,
          customHeaders: {
            "X-MyApp-MessageId": newMessage.data.id,
          },
        });
      }

      return res.status(200).json({
        error: false,
        message: "Resposta criada com sucesso",
        newMessage: newMessage.data,
      });
    } catch (error) {
      console.error("Erro ao responder mensagem:", error);
      return res.status(500).json({ error: true, message: error.message });
    }
  }

  async pegaCardsPorSetorID(req, res) {
    try {
      const { id } = req.params;
      const setor = await kanbanSetoresService.pegaSetorPorId_Services(id);
      if (!setor) {
        return res
          .status(404)
          .json({ message: "Setor não encontrado", error: true });
      }
      const cards = await kanbanCardsService.pegaCardsPorSetorID_Services(id);
      return res.status(200).json({ cards });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async pegaCardPorID(req, res) {
    try {
      const { card_id } = req.params;
      const card = await kanbanCardsService.pegaCardPorID_Services(card_id);
      if (!card) {
        return res.status(404).json({ error: "Erro ao buscar dados" });
      }
      return res.status(200).json(card);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar dados" });
    }
  }

  async atualizaColumnCard_Controller(req, res) {
    try {
      const { card_id, new_column_id } = req.body;
      if (!card_id || !new_column_id) {
        return res.status(400).json({
          error: true,
          message: "Os parâmetros card_id e new_column_id são obrigatórios",
        });
      }
      const column = await devAgile.KanbanComlumns.findOne({
        where: { id: new_column_id },
      });
      if (!column) {
        return res
          .status(404)
          .json({ error: true, message: "Coluna não encontrada" });
      }
      const result = await kanbanCardsService.atualizaColumnCard_Services(
        card_id,
        new_column_id
      );
      if (result.error) {
        return res.status(400).json({ error: true, message: result.message });
      }
      return res.status(200).json({ error: false, message: result.message });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  }
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = KanbanCards_Controller;
