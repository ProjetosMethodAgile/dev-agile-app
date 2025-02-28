const { devAgile } = require("../../models");
const KanbanColumn_Services = require("../../services/devagile_services/kanbanColumn_Services");
const KanbanSetores_Services = require("../../services/devagile_services/kanbanSetores_Services");
const Controller = require("../Controller");

const kanbanColumn_services = new KanbanColumn_Services();
const camposObrigatorios = ["nome", "posicao", "setor_id"];
const kanbanSetoresService = new KanbanSetores_Services();

class KanbanColumn_Controller extends Controller {
  constructor() {
    super(kanbanColumn_services, camposObrigatorios);
  }

  async cadastraColumn_Controller(req, res) {
    const { nome, posicao, setor_id } = req.body;

    const isTrue = await this.allowNull(req, res);
    if (!isTrue.status) {
      return res.status(500).json({
        message: "Preencha todos os campos necessários",
        campos: isTrue.campos,
        error: true,
      });
    }

    const setor = await devAgile.KanbanSetores.findOne({
      where: { id: setor_id },
    });

    if (!setor) {
      return res.status(404).json({
        message: "Não foi possível cadastrar a coluna",
        error: true,
      });
    }

    const validaPosicao = await kanbanColumn_services.validaPosicaoColumn_Services(
      posicao,
      setor_id
    );

    if (validaPosicao.error) {
      return res.status(404).json({
        message: "Posição já utilizada, favor informar outra",
        error: true,
      });
    }

    const column = await kanbanColumn_services.criaColumn_Services(
      nome,
      posicao,
      setor_id
    );

    if (column.error) {
      return res.status(404).json({
        message: column.message,
        error: true,
      });
    }
    return res.status(200).json({
      column: column.column,
      message: column.message,
      error: false,
    });
  }

  async pegaTodasColumnsPorSetorID(req, res) {
    try {
      const { setor_id } = req.body;

      // Valida o setor utilizando o serviço de setores
      const setor = await kanbanSetoresService.pegaSetorPorId_Services(setor_id);
      if (!setor) {
        return res.status(404).json({
          message: "Setor não encontrado",
          error: true,
        });
      }

      // Se o setor existe, busca todas as colunas associadas a ele
      const columns = await devAgile.KanbanComlumns.findAll({
        where: { setor_id },
      });

      return res.status(200).json({ columns });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = KanbanColumn_Controller;
