const { devAgile } = require("../../models");
const KanbanCards_Services = require("../../services/devagile_services/kanbanCards_Services");
const KanbanSetores_Services = require("../../services/devagile_services/kanbanSetores_Services");
const Controller = require("../Controller");
const { sendEmail } = require("../../utils/sendEmail");

const kanbanCardsService = new KanbanCards_Services();
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

  async cadastraCard_Controller(req, res) {
    try {
      const { setor_id, src_img_capa, titulo_chamado, status, descricao } =
        req.body;

      // Verifica se os campos obrigatórios foram preenchidos
      const isTrue = await this.allowNull(req, res);
      if (!isTrue.status) {
        return res.status(500).json({
          message: "Preencha todos os campos necessários",
          campos: isTrue.campos,
          error: true,
        });
      }

      // Valida se o setor existe
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

      // Busca a coluna do setor com posição "0"
      const column = await devAgile.KanbanComlumns.findOne({
        where: { setor_id, posicao: "0" },
      });
      if (!column) {
        return res.status(404).json({
          message: "Coluna de posição 0 não encontrada para o setor informado",
          error: true,
        });
      }

      // Cria o card utilizando o id da coluna encontrada
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

      // Envia email via AWS SES se o setor possuir um email válido
      if (setor.email_setor && isValidEmail(setor.email_setor)) {
        const emailSubject = `Novo card criado: ${titulo_chamado} [Msg #${result.createdMessage.id}] `;
        const emailBody = `Um novo card foi criado no setor ${setor.nome}.\n\nDescrição: ${descricao}`;
        try {
          // Envia o email e captura a resposta do SES
          const emailResponse = await sendEmail({
            to: process.env.MAIN_EMAIL,
            cc: setor.email_setor,
            subject: emailSubject,
            text: emailBody,
          });
          // Atualiza o registro da mensagem com o MessageId do SES para correlacionar o envio e futuras respostas
          if (result.createdMessage) {
            const updatedResult =
              await kanbanCardsService.atualizaEmailData_Services(
                result.createdMessage.id,
                { message_id: result.createdMessage.id }
              );
            console.log(
              "Mensagem atualizada com MessageId do SES:",
              updatedResult.updatedMessage
            );
          }
        } catch (emailError) {
          console.error("Erro ao enviar email via SES:", emailError);
          // Você pode optar por tratar o erro ou seguir mesmo que o email falhe
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

  // Método para atualizar os dados do email consumido pela Lambda
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

      // Atualiza os dados do e-mail usando o service
      const result = await kanbanCardsService.atualizaEmailData_Services(
        message_id, // Aqui, espera-se que message_id seja o ID do registro (criado na criação do card)
        {
          from_email,
          to_email,
          cc_email,
          bcc_email,
          subject,
          content_msg: textBody, // ou crie outro campo para htmlBody se necessário
          htmlBody,
          isReply,
        }
      );
      if (result.error) {
        return res.status(400).json({
          error: true,
          message: result.message,
        });
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

  async pegaCardsPorSetorID(req, res) {
    try {
      const { id } = req.params;
      const setor = await kanbanSetoresService.pegaSetorPorId_Services(id);
      if (!setor) {
        return res.status(404).json({
          message: "Setor não encontrado",
          error: true,
        });
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
        return res.status(404).json({
          error: true,
          message: "Coluna não encontrada",
        });
      }
      const result = await kanbanCardsService.atualizaColumnCard_Services(
        card_id,
        new_column_id
      );
      if (result.error) {
        return res.status(400).json({
          error: true,
          message: result.message,
        });
      }
      return res.status(200).json({
        error: false,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  }
}

// Função auxiliar para validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = KanbanCards_Controller;
