const { devAgile } = require("../../models/index.js");
const KanbanAtendente_Services = require("../../services/devagile_services/kanbanAtendente_Services.js");

class KanbanAtendente_Controller {
  constructor() {
    this.kanbanAtendenteService = new KanbanAtendente_Services();
  }

  // Cria um novo atendente vinculando o usuário e o setor requerido
  async criaAtendente_Controller(req, res) {
    const { usuario_id, setor_id, empresa_id } = req.body;

    // Garante que setor_id seja um array
    const setores = Array.isArray(setor_id) ? setor_id : [setor_id];

    if (!usuario_id || !empresa_id || !setores || setores.length === 0) {
      return res
        .status(500)
        .json({ error: true, message: "preencha todos campos necessarios" });
    }

    const empresa = await devAgile.Empresa.findOne({
      where: { id: empresa_id },
    });

    if (!empresa) {
      return res.status(500).json({ error: true, message: "empresa invalida" });
    }

    const result = await this.kanbanAtendenteService.criaAtendente_Services({
      usuario_id,
      setor_id: setores,
      empresa_id,
    });
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

  async consultaTodosAtendentesByEmpresaID_Controller(req, res) {
    const { id } = req.params;

    const empresa = await devAgile.Empresa.findOne({
      where: { id: id },
    });

    if (!empresa) {
      return res.status(500).json({ error: true, message: "empresa invalida" });
    }

    const atendentes =
      await this.kanbanAtendenteService.consultaTodosAtendentes_Services(id);

    return res.status(200).json({ atendentes: atendentes, error: false });
  }

  async consultaUsuariosNaoAtendentesByEmpresaID_Controller(req, res) {
    const { id } = req.params;

    const empresa = await devAgile.Empresa.findOne({
      where: { id: id },
    });

    if (!empresa) {
      return res.status(500).json({ error: true, message: "empresa invalida" });
    }

    const atendentes =
      await this.kanbanAtendenteService.consultaUsuariosNaoAtendentesByEmpresaID_Services(
        id
      );

    return res.status(200).json({ usuarios: atendentes, error: false });
  }
}

module.exports = KanbanAtendente_Controller;
