const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class KanbanMotivos_Services extends Services {
  constructor() {
    super("KanbanMotivos");
  }

  // Cria um novo motivo vinculado a um setor
  async criaMotivo_Services({ setor_id, descricao, src_img, sla_minutes }) {
    try {
      // opcional: evitar duplicidade na mesma descrição+setor
      const exists = await devAgile[this.nomeModel].findOne({
        where: { setor_id, descricao },
      });
      if (exists) {
        return { error: true, message: "Motivo já cadastrado neste setor" };
      }

      const novoMotivo = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        setor_id,
        descricao,
        src_img: src_img || null,
        sla_minutes,
      });
      return { error: false, motivo: novoMotivo };
    } catch (err) {
      console.error("Erro ao criar motivo:", err);
      return { error: true, message: "Erro ao criar motivo" };
    }
  }

  // Retorna todos os motivos
  async pegaTodosMotivos_Services() {
    try {
      const motivos = await devAgile[this.nomeModel].findAll();
      return { error: false, motivos };
    } catch (err) {
      console.error("Erro ao buscar motivos:", err);
      return { error: true, message: "Erro ao buscar motivos" };
    }
  }

  // Retorna motivos de um setor específico
  async pegaMotivoPorID_setor_Services(setor_id) {
    try {
      const motivos = await devAgile[this.nomeModel].findAll({
        where: { setor_id },
      });
      return { error: false, motivos };
    } catch (err) {
      console.error("Erro ao buscar motivos por setor:", err);
      return { error: true, message: "Erro ao buscar motivos" };
    }
  }

  // Retorna um motivo pelo ID
  async pegaMotivoPorId_Services(id) {
    try {
      const motivo = await devAgile[this.nomeModel].findByPk(id);
      if (!motivo) return { error: true, message: "Motivo não encontrado" };
      return { error: false, motivo };
    } catch (err) {
      console.error("Erro ao buscar motivo por ID:", err);
      return { error: true, message: "Erro ao buscar motivo" };
    }
  }

  // Atualiza campos de um motivo
  async atualizaMotivoPorId_Services(id, dados) {
    try {
      const motivo = await devAgile[this.nomeModel].findByPk(id);
      if (!motivo) {
        return { error: true, message: "Motivo não encontrado" };
      }
      // só atualiza campos que vieram
      const updates = {};
      if (dados.descricao !== undefined) updates.descricao = dados.descricao;
      if (dados.src_img !== undefined) updates.src_img = dados.src_img;
      if (dados.sla_minutes !== undefined)
        updates.sla_minutes = dados.sla_minutes;

      await motivo.update(updates);
      return { error: false, motivo };
    } catch (err) {
      console.error("Erro ao atualizar motivo:", err);
      return { error: true, message: "Erro ao atualizar motivo" };
    }
  }

  // Deleta um motivo
  async deletaMotivoPorId_Services(id) {
    try {
      const motivo = await devAgile[this.nomeModel].findByPk(id);
      if (!motivo) return { error: true, message: "Motivo não encontrado" };
      await motivo.destroy();
      return { error: false, message: "Motivo deletado com sucesso" };
    } catch (err) {
      console.error("Erro ao deletar motivo:", err);
      return { error: true, message: "Erro ao deletar motivo" };
    }
  }
}

module.exports = KanbanMotivos_Services;
