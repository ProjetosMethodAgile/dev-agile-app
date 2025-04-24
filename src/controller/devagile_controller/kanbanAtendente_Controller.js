const { devAgile } = require("../../models/index.js");
const KanbanAtendente_Services = require("../../services/devagile_services/kanbanAtendente_Services.js");
const KanbanSessao_Services = require("../../services/devagile_services/kanbanSessao_Services.js");

const ws = require("../../websocket.js");
const kanbanSessao_Services = new KanbanSessao_Services();

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
  async ativaAtendente_controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanAtendenteService.ativaAtendente_Services(
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

  async vinculaAtendenteToCard_Controller(req, res) {
    const { usuario_id } = req.body;
    const { sessao_id } = req.params;

    const sessao = await kanbanSessao_Services.pegaSessaoCardPorId_Services(
      sessao_id
    );

    const { atendente } =
      await this.kanbanAtendenteService.consultaAtendente_Services(usuario_id);

    if (!sessao || !atendente) {
      return res.status(404).json({
        error: true,
        message: "nenhuma sessao ou atendente encontrado",
      });
    }

    const validaDuplicidade =
      await kanbanSessao_Services.validaSessaoPorAtendenteId_Services(
        atendente.id,
        sessao_id
      );
    if (validaDuplicidade) {
      return res
        .status(200)
        .json({ error: true, message: "ja vinculado ao card" });
    }
    const vinculo =
      await this.kanbanAtendenteService.vinculaAtendenteToCard_Services(
        atendente.id,
        sessao_id,
        sessao.card_id
      );

    if (!vinculo.error) {
      return res
        .status(200)
        .json({ error: false, message: "atendente vinculado ao card" });
    } else {
      return res
        .status(404)
        .json({ error: true, message: "erro ao vincular atendente" });
    }
  }
}

module.exports = KanbanAtendente_Controller;
