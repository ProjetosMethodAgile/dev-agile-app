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
      // Envia email via SES se o setor possuir um email válido
      if (setor.email_setor && isValidEmail(setor.email_setor)) {
        const emailSubject = `Novo card criado: ${titulo_chamado}`;
        const emailBody = `Um novo card foi criado no setor ${setor.nome}.\n\nDescrição: ${descricao}`;
        try {
          // Envia o email e inclui o id do registro criado no header customizado
          const emailResponse = await sendEmailRaw({
            to: process.env.MAIN_EMAIL,
            cc: setor.email_setor,
            subject: emailSubject,
            text: emailBody,
            customHeaders: {
              "X-MyApp-MessageId": emailResponse.MessageId,
            },
          });
          console.log("Email enviado. SES response:", emailResponse.MessageId);

          // Aqui você pode atualizar o registro com o MessageId retornado pelo SES,
          // caso deseje que o valor salvo no banco seja o MessageId do SES.
          const updatedResult =
            await kanbanCardsService.atualizaEmailData_Services(
              result.createdMessage.id,
              { message_id: emailResponse.MessageId }
            );
          console.log(
            "Mensagem atualizada com MessageId do SES:",
            updatedResult.updatedMessage
          );
        } catch (emailError) {
          console.error("Erro ao enviar email via SES:", emailError);
        }
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

  // Novo método para cadastro com usuário autenticado
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
        const emailSubject = `Novo card criado: ${titulo_chamado}`;
        const emailBody = `Um novo card foi criado no setor ${setor.nome}.\n\nDescrição: ${descricao}`;
        try {
          // Envia o email e inclui no header o id que foi salvo
          const emailResponse = await sendEmailRaw({
            to: user_email,
            cc: [setor.email_setor, process.env.MAIN_EMAIL],
            subject: emailSubject,
            text: emailBody,
            customHeaders: {
              "X-MyApp-MessageId": result.createdMessage.id,
            },
          });
          console.log("Email enviado. SES response:", emailResponse);

          // Aqui você pode atualizar o registro com o MessageId retornado pelo SES,
          // caso deseje que o valor salvo no banco seja o MessageId do SES.
          const updatedResult =
            await kanbanCardsService.atualizaEmailData_Services(
              result.createdMessage.id,
              { message_id: emailResponse.MessageId }
            );
          console.log(
            "Mensagem atualizada com MessageId do SES:",
            emailResponse
          );
        } catch (emailError) {
          console.error("Erro ao enviar email via SES:", emailError);
        }
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
      // Payload esperado: { message_id, from_email, to_email, cc_email, bcc_email, subject, textBody, htmlBody, isReply }
      const {
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
      const result = await kanbanCardsService.atualizaEmailData_Services(
        message_id,
        {
          from_email,
          to_email,
          cc_email,
          bcc_email,
          subject,
          content_msg: textBody,
          htmlBody,
          isReply,
        }
      );
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
      /*
        Exemplo de body esperado:
        {
          "original_message_id": "uuid-da-mensagem",
          "content_msg": "Texto da resposta",
          // se quiser, pode passar "usuario_id" ou "atendente_id"
          // ou deduzir do token (req.user)
        }
      */
      const { original_message_id, content_msg, atendente_id, cliente_id } =
        req.body;
      if (!original_message_id || !content_msg) {
        return res.status(400).json({
          error: true,
          message:
            "Dados insuficientes (original_message_id e content_msg são obrigatórios).",
        });
      }

      // 1. Localiza a mensagem original
      const originalMsg = await kanbanCardsService.pegaMensagemPorId_Services(
        original_message_id
      );
      if (!originalMsg) {
        return res.status(404).json({
          error: true,
          message: "Mensagem original não encontrada",
        });
      }

      // 3. Cria a nova mensagem (in_reply_to = original_message_id)
      const newMessage = await kanbanCardsService.replyMessage_Services({
        originalMsg,
        content_msg,
        atendente_id,
        cliente_id,
      });

      if (newMessage.error) {
        return res
          .status(400)
          .json({ error: true, message: newMessage.message });
      }

      //se o foi o atendente que mandou a menssagem, envia para o email cliente, caso contrario manda para o atendente
      if (atendente_id) {
        await sendEmailRaw({
          to: originalMsg.from_email,
          subject: `Re: Chamado #${originalMsg.sessao_id}`,
          text: `Atendente respondeu: ${content_msg}`,
          // Se quiser HTML
          // html: `<p>Atendente respondeu: ${content_msg}</p>`,
          // Se a mensagem original tem "message_id" = <xxx@ses.amazonaws.com>
          inReplyTo: originalMsg.message_id,
          references: `<${originalMsg.message_id}>`,
          customHeaders: {
            "X-MyApp-MessageId": newMessage.data.id,
          },
        });
      } else {
        // se foi o usuario que mandou a mensagem, envia para o atendente / setor
        await sendEmailRaw({
          to: originalMsg.from_email,
          subject: `Re: Chamado #${originalMsg.sessao_id}`,
          text: `Usuario respondeu: ${content_msg}`,
          // Se quiser HTML
          // html: `<p>Atendente respondeu: ${content_msg}</p>`,
          // Se a mensagem original tem "message_id" = <xxx@ses.amazonaws.com>
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
