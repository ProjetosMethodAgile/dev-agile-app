const { devAgile } = require("../../models");
const KanbanCards_Services = require("../../services/devagile_services/kanbanCards_Services");
const KanbanSetores_Services = require("../../services/devagile_services/kanbanSetores_Services");
const Controller = require("../Controller");

const kanbanCardsService = new KanbanCards_Services();
const kanbanSetoresService = new KanbanSetores_Services();
const camposObrigatorios = [
  "setor_id",
  "src_img_capa",
  "titulo_chamado",
  "status",
];

class KanbanCards_Controller extends Controller {
  constructor() {
    super(kanbanCardsService, camposObrigatorios);
  }

  async cadastraCard_Controller(req, res) {
    try {
      const { setor_id, src_img_capa, titulo_chamado, status } = req.body;

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
      const setor = await kanbanSetoresService.pegaSetorPorId_Services(
        setor_id
      );
      if (!setor) {
        return res.status(404).json({
          message: "Setor não encontrado",
          error: true,
        });
      }

      // Busca a coluna do setor com posicao "0"
      const column = await devAgile.KanbanComlumns.findOne({
        where: { setor_id, posicao: "0" },
      });

      if (!column) {
        return res.status(404).json({
          message: "Coluna de posicao 0 não encontrada para o setor informado",
          error: true,
        });
      }

      // Cria o card utilizando o id da coluna encontrada
      const result = await kanbanCardsService.cadastraCard_Services(
        column.id,
        src_img_capa,
        titulo_chamado,
        status
      );

      if (result.error) {
        return res.status(404).json({
          message: result.message,
          error: true,
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
}

module.exports = KanbanCards_Controller;
