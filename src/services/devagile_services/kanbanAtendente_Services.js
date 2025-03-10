const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class KanbanAtendente_Services extends Services {
  constructor() {
    super("KanbanAtendenteHelpDesk");
  }

  // Cria um novo atendente e vincula a um setor
  async criaAtendente_Services(dados) {
    try {
      // Cria o atendente usando o usuário informado
      const novoAtendente = await devAgile.KanbanAtendenteHelpDesk.create({
        id: uuid.v4(),
        usuario_id: dados.usuario_id,
        empresa_id: dados.empresa_id,
      });

      // Cria a associação entre o atendente e o setor informado
      await devAgile.KanbanAtendenteSetores.create({
        id: uuid.v4(), // se sua tabela intermediária possuir a coluna id
        atendente_id: novoAtendente.id,
        setor_id: dados.setor_id,
      });

      return { error: false, atendente: novoAtendente };
    } catch (err) {
      console.error("Erro ao criar atendente:", err);
      return { error: true, message: "Erro ao criar atendente" };
    }
  }

  // Consulta um atendente pelo ID, incluindo os setores vinculados
  async consultaAtendente_Services(id) {
    try {
      const atendente = await devAgile[this.nomeModel].findByPk(id, {
        include: [
          {
            model: devAgile["KanbanSetores"],
            as: "Setores",
            through: { attributes: [] },
          },
          {
            model: devAgile.Usuario,
            as: "UsuarioAtendente",
          },
        ],
      });
      if (!atendente)
        return { error: true, message: "Atendente não encontrado" };
      return { error: false, atendente };
    } catch (err) {
      console.error("Erro ao consultar atendente:", err);
      return { error: true, message: "Erro ao consultar atendente" };
    }
  }

  async consultaTodosAtendentes_Services(id) {
    try {
      const atendentes = await devAgile[this.nomeModel].findAll({
        where: { empresa_id: id },

        include: [
          {
            model: devAgile["KanbanSetores"],
            as: "Setores",
            through: { attributes: [] },
          },
          {
            model: devAgile.Usuario,
            as: "UsuarioAtendente",
          },
        ],
      });

      return atendentes;
    } catch (error) {
      console.error("Erro ao consultar atendente:", err);
      return { error: true, message: "Erro ao consultar atendente" };
    }
  }

  // Deleta um atendente pelo ID
  async deletaAtendente_Services(id) {
    try {
      const atendente = await devAgile[this.nomeModel].findByPk(id);
      if (!atendente)
        return { error: true, message: "Atendente não encontrado" };
      await atendente.destroy();
      return { error: false, message: "Atendente deletado com sucesso" };
    } catch (err) {
      console.error("Erro ao deletar atendente:", err);
      return { error: true, message: "Erro ao deletar atendente" };
    }
  }
}

module.exports = KanbanAtendente_Services;
