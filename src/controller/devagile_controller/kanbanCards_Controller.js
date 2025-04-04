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
            // customHeaders: {
            //   "X-MyApp-MessageId": emailResponse.MessageId,
            // },
          });
          console.log("Email enviado. SES response:", emailResponse.MessageId);

          // Aqui você pode atualizar o registro com o MessageId retornado pelo SES,
          // caso deseje que o valor salvo no banco seja o MessageId do SES.
          const updatedResult =
            await kanbanCardsService.atualizaEmailDataPorID_Service(
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
        // e formate-o conforme o padrão: <uniqueid@dominio>

        const emailSubject = `Novo card criado: ${titulo_chamado}`;
        const emailBodySetor = `Um novo card foi criado no setor ${setor.nome}.\n\nDescrição: ${descricao}`;
        const emailBodyUser = `Seu chamado foi aberto para o setor ${setor.nome}.\n Logo um atendente entrara em contato.\n\nDescrição do chamado: ${descricao}`;

        try {
          // Envia o email definindo tanto o header customizado quanto o Message-ID padrão
          const emailToSetorResponse = await sendEmailRaw({
            to: [setor.email_setor, process.env.MAIN_EMAIL],
            subject: emailSubject,
            text: emailBodySetor,
            // customHeaders: {
            //   "message-id": formattedMessageId, // Header padrão que será usado pelos clientes de email
            // },
          });
          console.log("Email enviado. SES response:", emailToSetorResponse);
          const emailToUsrResponse = await sendEmailRaw({
            to: user_email,
            cc: [process.env.MAIN_EMAIL],
            subject: emailSubject,
            text: emailBodyUser,
            // customHeaders: {
            //   "message-id": formattedMessageId, // Header padrão que será usado pelos clientes de email
            // },
          });
          console.log("Email enviado. SES response:", emailToUsrResponse);
          //pegando id da message enviada por email para o usuario e concatenando com o dominio do AWS SES para a validação na lambda comparar e atribuir os valores
          const messageId = emailToUsrResponse.MessageId;
          const formattedMessageId = `<${messageId}@sa-east-1.amazonses.com>`;

          // Atualiza o registro com o MessageId retornado pelo SES, se necessário
          const updatedResult =
            await kanbanCardsService.atualizaEmailDataPorID_Service(
              result.createdMessage.id,
              { message_id: formattedMessageId }
            );
          console.log(
            "Mensagem atualizada com MessageId do SES:",
            formattedMessageId
          );
          return res.status(200).json({
            card: result.card,
            atualizacao: updatedResult.updatedMessage,
            message: result.message,
            error: false,
          });
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
      // Atualiza os dados do email usando o serviço, buscando pelo email_id do registro
      const result =
        await kanbanCardsService.atualizaEmailDataPorEmailID_Service(
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
      // Agora esperamos também message_id no payload (opcional)
      const {
        inReplyTo,
        textBody,
        message_id,
        from_email,
        htmlBody,
        to_email,
        cc_email,
        bcc_email,
        subject,
        references,
        identify_atendente,
      } = req.body;
      console.log(inReplyTo);
      if (!inReplyTo || !textBody) {
        return res.status(400).json({
          error: true,
          message:
            "Dados insuficientes (inReplyTo e textBody são obrigatórios).",
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

      let cliente_id;
      let atendente_id;
      //quando solicitado do front é passado um usuario id para identificar o atendente_id que respondeu
      if (identify_atendente) {
        const atendente = await devAgile.KanbanAtendenteHelpDesk.findOne({
          where: { usuario_id: identify_atendente },
        });
        atendente_id = atendente.id;
      } else {
        cliente_id = originalMsg.cliente_id;
      }

      // console.log(textBody);
      // console.log("atendente_id");
      // console.log(atendente_id);
      // console.log("cliente_id");
      // console.log(cliente_id);
      // console.log("message_id");
      // console.log(message_id);
      // console.log("htmlBody");
      // console.log(htmlBody);

      // 2. Cria a nova mensagem, vinculando-a à mensagem original
      const newMessage = await kanbanCardsService.replyMessage_Services({
        originalMsg, // dados da menssagem respondida
        textBody, //corpo do email
        atendente_id,
        cliente_id,
        message_id, // repassa o message id do email que foi enviado, se existir
        inReplyTo,
        from_email,
        htmlBody,
        to_email,
        cc_email,
        bcc_email,
        subject,
        references,
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
          to: originalMsg.to_email, // destinatário é o email do usuário que abriu o chamado
          subject: `Re: Chamado #${originalMsg.sessao_id}`,
          text: `Atendente respondeu: ${textBody}`,
          inReplyTo: originalMsg.message_id,
          references: `<${originalMsg.message_id}>`,
          customHeaders: {
            "message-id-db": newMessage.data.id, //usado para que na lambda a reposta consiga idenmtificar e atribuir o real id desse email no DB
          },
        });
      } else {
        // await sendEmailRaw({
        //   to: originalMsg.from_email, // destinatário é o email do setor ou do atendente
        //   subject: `Re: Chamado #${originalMsg.sessao_id}`,
        //   text: `Usuário respondeu: ${textBody}`,
        //   inReplyTo: originalMsg.message_id,
        //   references: `<${originalMsg.message_id}>`,
        //   customHeaders: {
        //     "message-id-db": newMessage.data.id,
        //   },
        // });
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
