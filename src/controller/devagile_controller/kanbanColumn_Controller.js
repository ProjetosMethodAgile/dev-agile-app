const e = require("express");
const { devAgile } = require("../../models");
const KanbanColumn_Services = require("../../services/devagile_services/kanbanColumn_Services");
const KanbanSetores_Services = require("../../services/devagile_services/kanbanSetores_Services");
const Controller = require("../Controller");
const kanban_Acao_Services = require("../../services/devagile_services/kanban_Acao_Services");

const kanbanColumn_services = new KanbanColumn_Services();
const camposObrigatorios = ["nome", "posicao", "setor_id","id_acao"];
const kanbanSetoresService = new KanbanSetores_Services();

const kanban_acao_services = new kanban_Acao_Services();
class KanbanColumn_Controller extends Controller {
  constructor() {
    super(kanbanColumn_services, camposObrigatorios);
  }

  async cadastraColumn_Controller(req, res) {
    const { nome, posicao, setor_id,id_acao} = req.body;

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
    const idAcao = await kanban_acao_services.validaAcaoID(id_acao)
    
    if (!idAcao) {
      return res.status(404).json({
        message: "Id ação invalido",
        error: true,
      });

    }
    
    const column = await kanbanColumn_services.cadastraColumn_Service(
      nome,
      posicao,
      setor_id,
      id_acao
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

  async pegaTodasColumnsPorSetorEEmpresaID_Controller(req, res) {
    try {
      const { set_id, emp_id } = req.params;
      if (!emp_id || !set_id) {
        return res
          .status(404)
          .json({ error: true, message: "preencha os dados necessarios" });
      }

      const { columnsList, ok } =
        await kanbanColumn_services.pegaTodasColumnsPorSetorEEmpresaID_Services(
          set_id,
          emp_id
        );
      if (!ok) {
        return res
          .status(404)
          .json({ error: true, message: "erro ao buscar registros" });
      }
      return res.status(200).json(columnsList);
    } catch (error) {
      console.log(error);
      return res
        .status(404)
        .json({ error: true, message: "erro ao buscar registros" });
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


 
async  pega_posicaoKanban_controller(req,res) {

  
  const {setor_id} = req.body
  console.log(setor_id);
  
  try {
    const posicaoColumns = await kanbanColumn_services.pegaPosicaoColumn_Services(setor_id);
      console.log(posicaoColumns);
      return res.status(200).json({posicaoColumns})

  } catch (error) {
    console.error('Erro ao pegar posição do Kanban:', error);
    return res.status(404).json({
      message:
        "Não foi possível atualizar, contate o administrador do sistema",
      error: true,
    });
  }

}
  
}

module.exports = KanbanColumn_Controller;
