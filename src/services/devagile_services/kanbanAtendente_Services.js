const Services = require("../Services.js");
const { devAgile, sequelizeDevAgileCli } = require("../../models/index.js");
const uuid = require("uuid");
const ws = require("../../websocket.js");

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

      // Itera pelo array de setores e cria as associações
      await Promise.all(
        dados.setor_id.map(async (id) => {
          await devAgile.KanbanAtendenteSetores.create({
            id: uuid.v4(), // se sua tabela intermediária possuir a coluna id
            atendente_id: novoAtendente.id,
            setor_id: id,
          });
        })
      );

      return { error: false, atendente: novoAtendente };
    } catch (err) {
      console.error("Erro ao criar atendente:", err);
      return { error: true, message: "Erro ao criar atendente" };
    }
  }

  async vinculaAtendenteToCard_Services(
    atendente_id,
    sessao_id,
    card_id,
    empresa_id
  ) {
    let vinculo;
    const transaction = await sequelizeDevAgileCli.transaction();

    try {
      const card = await devAgile.KanbanCards.findOne({
        where: { id: card_id },
        include: [{ model: devAgile.KanbanComlumns, as: "ColumnsCard" }],
        transaction,
      });
      if (!card) throw new Error("Card não encontrado");

      const previousColumnName = card.ColumnsCard.nome;
      const previousStatusId = card.status_card_id;

      vinculo = await devAgile.KanbanSessoesAtendentes.create(
        {
          id: uuid.v4(),
          sessao_id,
          atendente_id,
          visualizacao_atendente: true,
        },
        { transaction }
      );

      await devAgile.KanbanStatusHistory.create(
        {
          id: uuid.v4(),
          card_id: card_id,
          status_card_id: previousStatusId,
          previous_status_card_id: previousStatusId,
          changed_by: atendente_id,
          usuario_id: null, // não é ação de cliente
          empresa_id,
          setor_id: card.ColumnsCard.setor_id,
          action_type: "vinculo_atendente",
          previous_column: previousColumnName,
          column_atual: previousColumnName,
        },
        { transaction }
      );

      await transaction.commit();
      ws.broadcast({
        type: `cardUpdated-${card_id}`,
        message: "atendente vinculado ao card",
      });
      return { vinculo, error: false };
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return { vinculo, error: true };
    }
  }

  // Consulta um atendente pelo ID, incluindo os setores vinculados
  async consultaAtendente_Services(id) {
    try {
      const atendente = await devAgile[this.nomeModel].findOne({
        include: [
          {
            model: devAgile["KanbanSetores"],
            as: "Setores",
            through: { attributes: [] },
          },
          {
            model: devAgile.Usuario,
            as: "UsuarioAtendente",
            where: { id },
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
  async consultaTodosAtendente_Services(empresaId) {
    try {

      const atendentes = await devAgile[this.nomeModel].findAll({
        where: {
          empresa_id: empresaId,       // filtra somente os atendentes dessa empresa
        },
        attributes: {
          include: ["status"],
        },
        include: [
          {
            model: devAgile["KanbanSetores"],
            as: "Setores",
            through: {
            model: devAgile.KanbanAtendenteSetores,
            attributes:{
              include: ["status"],      // <– aqui
              
            } 
          },
          },
          {
            model: devAgile.Usuario,
            as: "UsuarioAtendente",
          },
         
        ],
      });

  
      if (!atendentes || atendentes.length === 0) {
        return { error: true, message: "Nenhum Atendente encontrado para essa empresa" };
      }
  
      return { error: false, atendentes };
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
  async deletaAtendente_Services(id) {
    try {
      const AtendenteModel = devAgile[this.nomeModel];
  
      const atendente = await AtendenteModel.findOne({ where: { id } });
      if (!atendente) {
        return { error: true, message: "Atendente não encontrado" };
      }
  
      await atendente.update({ status: false });
  
      return { error: false, message: "Atendente deletado com sucesso" };
    } catch (err) {
      console.error("Erro ao deletar atendente:", err);
      return { error: true, message: "Erro ao deletar atendente" };
    }
  }
  async ativaAtendente_Services(id) {
    try {
      const AtendenteModel = devAgile[this.nomeModel];
  
      const atendente = await AtendenteModel.findOne({ where: { id } });
      if (!atendente) {
        return { error: true, message: "Atendente não encontrado" };
      }
  
      await atendente.update({ status: true });
  
      return { error: false, message: "Atendente Ativo com sucesso" };
    } catch (err) {
      console.error("Erro ao ativar o atendente:", err);
      return { error: true, message: "Erro ao Ativar o atendente" };
    }
  }
  

  async consultaUsuariosNaoAtendentesByEmpresaID_Services(id) {
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
      const usuarios = await devAgile.Usuario_Empresa.findAll({
        where: { empresa_id: id },
        include: [
          {
            model: devAgile.Usuario,
            as: "usuario",
          },
        ],
      });

      const usuariosLivres = usuarios.filter((usuario) => {
        // usuario.usuario.id: considerando que o objeto retornado do include tem a propriedade "usuario"
        return !atendentes.some(
          (atendente) => atendente.usuario_id === usuario.usuario_id
        );
      });

      return usuariosLivres;
    } catch (error) {
      console.error("Erro ao consultar atendente:", error);
      return { error: true, message: "Erro ao consultar atendente" };
    }
  }
}

module.exports = KanbanAtendente_Services;
