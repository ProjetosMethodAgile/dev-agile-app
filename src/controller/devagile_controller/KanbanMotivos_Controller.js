const KanbanMotivos_Services = require("../../services/devagile_services/KanbanMotivos_Services");

class KanbanMotivos_Controller {
  constructor() {
    this.kanbanMotivosService = new KanbanMotivos_Services();
  }

  // POST /api/motivos
  async criaMotivo_Controller(req, res) {
    const { setor_id, descricao, src_img, sla_minutes } = req.body;

    // validações básicas
    if (!setor_id || !descricao || sla_minutes == null) {
      return res
        .status(400)
        .json({
          error: true,
          message: "Preencha setor_id, descricao e sla_minutes",
        });
    }
    if (!Number.isInteger(sla_minutes) || sla_minutes <= 0) {
      return res
        .status(400)
        .json({
          error: true,
          message: "sla_minutes deve ser inteiro positivo",
        });
    }

    const result = await this.kanbanMotivosService.criaMotivo_Services({
      setor_id,
      descricao,
      src_img,
      sla_minutes,
    });
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(201).json(result.motivo);
  }

  // GET /api/motivos
  async pegaTodosMotivos_Controller(req, res) {
    const result = await this.kanbanMotivosService.pegaTodosMotivos_Services();
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivos);
  }

  // GET /api/motivos/setor/:id
  async pegaMotivoPorID_setor_Controller(req, res) {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: true, message: "setor_id não fornecido" });
    }
    const result =
      await this.kanbanMotivosService.pegaMotivoPorID_setor_Services(id);
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivos);
  }

  // GET /api/motivos/:id
  async pegaMotivoPorId_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanMotivosService.pegaMotivoPorId_Services(id);
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivo);
  }

  // PUT /api/motivos/:id
  async atualizaMotivoPorId_Controller(req, res) {
    const { id } = req.params;
    const { descricao, src_img, sla_minutes } = req.body;

    // opcional: validar sla_minutes se presente
    if (
      sla_minutes != null &&
      (!Number.isInteger(sla_minutes) || sla_minutes <= 0)
    ) {
      return res
        .status(400)
        .json({
          error: true,
          message: "sla_minutes deve ser inteiro positivo",
        });
    }

    const result = await this.kanbanMotivosService.atualizaMotivoPorId_Services(
      id,
      { descricao, src_img, sla_minutes }
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivo);
  }

  // DELETE /api/motivos/:id
  async deletaMotivoPorId_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanMotivosService.deletaMotivoPorId_Services(
      id
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json({ message: result.message });
  }
}

module.exports = KanbanMotivos_Controller;
