const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");
const { where } = require("sequelize");

class KanbanMotivos_Services extends Services {
  constructor() {
    super("KanbanMotivos");
  }

  // Cria um novo motivo vinculado a um setor
  async criaMotivo_Services(dados) {
    try {
      const novoMotivo = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        setor_id: dados.setor_id,
        descricao: dados.descricao,
        src_img: dados.src_img || null,
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
  
  async pegaMotivoPorID_setor_Services(idsetor) {
    try {
      const motivos = await devAgile[this.nomeModel].findAll({
        where: { setor_id:idsetor },
      });
  
      return { error: false, motivos };
    } catch (err) {
      console.error("Erro ao buscar motivos:", err);
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

async atualizaMotivoPorId_Services(id, dados) {
  try {

    const motivo = await devAgile[this.nomeModel].findByPk(id);
    if (!motivo) {
      return { error: true, message: "Motivo não encontrado" };
    }
    console.log(dados);
    
    await motivo.update({ descricao: dados.descricao, src_img:dados.src_img });
    return { error: false, motivo };

  } catch (err) {
    console.error("Erro ao atualizar motivo:", err);
    return { error: true, message: "Erro ao atualizar motivo" };
  }
}


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
