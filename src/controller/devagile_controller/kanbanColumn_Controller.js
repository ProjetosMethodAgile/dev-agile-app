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

    const validaPosicao =
      await kanbanColumn_services.validaPosicaoColumn_Services(
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
      const { id } = req.params;

      // Valida o setor utilizando o serviço de setores
      const setor = await kanbanSetoresService.pegaSetorPorId_Services(id);
      if (!setor) {
        return res.status(404).json({
          message: "Setor não encontrado",
          error: true,
        });
      }

      // Se o setor existe, busca todas as colunas associadas a ele
      const columns = await devAgile.KanbanComlumns.findAll({
        where: { setor_id: id },
      });

      return res.status(200).json({ columns });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async atualizaOrdemColumnsPorSetorID_Controller(req, res) {
    const { setor_id, setor_list } = req.body;
    try {
      const setor = await devAgile.KanbanSetores.findOne({
        where: { id: setor_id },
      });

      if (!setor) {
        return res.status(404).json({
          message:
            "Não foi possível atualizar, contate o administrador do sistema",
          error: true,
        });
      }

      if (!setor_list && !setor_list.length) {
        return res.status(404).json({
          message:
            "Não foi possível atualizar, contate o administrador do sistema",
          error: true,
        });
      }

      const { message, error } =
        await kanbanColumn_services.atualizaOrdemColumnsPorSetorID_Services(
          setor_id,
          setor_list
        );
      if (!error) {
        return res.status(200).json({
          message: { message },
          error: false,
        });
      }
      return res.status(404).json({
        message: { message },
        error: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json({
        message:
          "Não foi possível atualizar, contate o administrador do sistema",
        error: true,
      });
    }
  }
}

module.exports = KanbanColumn_Controller;
