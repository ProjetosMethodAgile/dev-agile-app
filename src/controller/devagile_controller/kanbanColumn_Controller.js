const { devAgile } = require("../../models");
const KanbanColumn_Services = require("../../services/devagile_services/kanbanColumn_Services");
const Controller = require("../Controller");

const kanbanColumn_services = new KanbanColumn_Services();
const camposObrigatorios = ["nome", "posicao", "setor_id"];

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

    if (setor === null) {
      return res
        .status(404)
        .json({ message: "não foi possivel cadastrar a coluna", error: true });
    }

    const ValidaPosicao =
      await kanbanColumn_services.validaPosicaoColumn_Services(
        posicao,
        setor_id
      );

    if (ValidaPosicao.error) {
      return res.status(404).json({
        message: "posição já utilizada, favor informar outra",
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
    const { setor_id } = req.body;
  }
}

module.exports = KanbanColumn_Controller;
