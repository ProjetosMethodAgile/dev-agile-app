const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class KanbanSetores_Services extends Services {
  constructor() {
    super("KanbanSetores");
  }

  // Busca todos os setores da empresa (pela empresa_id)
  async buscaSetoresPorEmpresa_Services(empresa_id) {
    try {
      const setores = await devAgile[this.nomeModel].findAll({
        where: { empresa_id },
      });
      return { error: false, setores };
    } catch (err) {
      console.error("Erro ao buscar setores por empresa:", err);
      return { error: true, message: "Erro ao buscar setores" };
    }
  }

  // Cria um novo setor
  async criaSetor_Services(dados) {
    try {
      const novoSetor = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        empresa_id: dados.empresa_id, // vincula o setor à empresa
        nome: dados.nome,
      });
      return { error: false, setor: novoSetor };
    } catch (err) {
      console.error("Erro ao criar setor:", err);
      return { error: true, message: "Erro ao criar setor" };
    }
  }

  // Retorna um setor pelo ID
  async pegaSetorPorId_Services(id) {
    try {
      const setor = await devAgile[this.nomeModel].findByPk(id);
      if (!setor) return { error: true, message: "Setor não encontrado" };
      return { error: false, setor };
    } catch (err) {
      console.error("Erro ao buscar setor por ID:", err);
      return { error: true, message: "Erro ao buscar setor" };
    }
  }

  // Atualiza um setor pelo ID
  async atualizaSetorPorId_Services(id, dados) {
    try {
      const setor = await devAgile[this.nomeModel].findByPk(id);
      if (!setor) return { error: true, message: "Setor não encontrado" };
      await setor.update(dados);
      return { error: false, setor };
    } catch (err) {
      console.error("Erro ao atualizar setor:", err);
      return { error: true, message: "Erro ao atualizar setor" };
    }
  }

  // Deleta um setor pelo ID
  async deletaSetorPorId_Services(id) {
    try {
      const setor = await devAgile[this.nomeModel].findByPk(id);
      if (!setor) return { error: true, message: "Setor não encontrado" };
      await setor.destroy();
      return { error: false, message: "Setor deletado com sucesso" };
    } catch (err) {
      console.error("Erro ao deletar setor:", err);
      return { error: true, message: "Erro ao deletar setor" };
    }
  }
}

module.exports = KanbanSetores_Services;
