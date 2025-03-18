const KanbanSetores_Services = require("../../services/devagile_services/kanbanSetores_Services");

class KanbanSetores_Controller {
  constructor() {
    this.kanbanSetoresService = new KanbanSetores_Services();
  }

  // Busca setores por empresa_id
  async buscaSetoresPorEmpresa_Controller(req, res) {
    const { empresa_id } = req.params;
    const result =
      await this.kanbanSetoresService.buscaSetoresPorEmpresa_Services(
        empresa_id
      );
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.setores);
  }

  async pegaSetorPorUsrAndEmp_Controller(req, res) {
    try {
      const { emp_id, usr_id } = req.params;

      if (!emp_id || !usr_id) {
        return res
          .status(404)
          .json({ error: true, message: "preencha os dados necessarios" });
      }
      const setoreslist =
        await this.kanbanSetoresService.pegaSetorPorUsrAndEmp_Services(
          emp_id,
          usr_id
        );

      if (!setoreslist.ok) {
        return res.status(404).json({
          error: true,
          message: setoreslist.message,
        });
      }
      return res.status(200).json({ setoreslist });
    } catch (error) {
      console.log(error);
      return res.status(404).json({
        error: true,
        message: "erro ao consultar dados, contate o administrador do sistema",
      });
    }
  }

  // Cria um novo setor
  async criaSetor_Controller(req, res) {
    const dados = req.body; // espera receber { empresa_id, nome }
    const result = await this.kanbanSetoresService.criaSetor_Services(dados);
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(201).json(result.setor);
  }

  // Busca um setor pelo ID
  async pegaSetorPorId_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanSetoresService.pegaSetorPorId_Services(id);
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.setor);
  }

  // Atualiza um setor pelo ID
  async atualizaSetorPorId_Controller(req, res) {
    const { id } = req.params;
    const dados = req.body;
    const result = await this.kanbanSetoresService.atualizaSetorPorId_Services(
      id,
      dados
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.setor);
  }

  // Deleta um setor pelo ID
  async deletaSetorPorId_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanSetoresService.deletaSetorPorId_Services(
      id
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json({ message: result.message });
  }
}

module.exports = KanbanSetores_Controller;
