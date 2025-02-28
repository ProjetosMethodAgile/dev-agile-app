const KanbanAtendente_Services = require("../../services/devagile_services/kanbanAtendente_Services.js");

class KanbanAtendente_Controller {
  constructor() {
    this.kanbanAtendenteService = new KanbanAtendente_Services();
  }

  // Cria um novo atendente vinculando o usuário e o setor requerido
  async criaAtendente_Controller(req, res) {
    // Espera receber { usuario_id, setor_id } no body

    const dados = req.body;
    const result = await this.kanbanAtendenteService.criaAtendente_Services(
      dados
    );
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(201).json(result.atendente);
  }

  // Consulta um atendente pelo ID (incluindo os setores vinculados)
  async consultaAtendente_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanAtendenteService.consultaAtendente_Services(
      id
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.atendente);
  }

  // Deleta um atendente pelo ID
  async deletaAtendente_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanAtendenteService.deletaAtendente_Services(
      id
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json({ message: result.message });
  }
}

module.exports = KanbanAtendente_Controller;
