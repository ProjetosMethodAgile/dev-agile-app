const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class Empresa_Services extends Services {
  constructor() {
    super("Empresa");
  }

  // Criar uma nova empresa
  async criaEmpresa_Services(dados) {
    // Verifica se já existe uma empresa com o mesmo CNPJ
    const empresaExistente = await devAgile[this.nomeModel].findOne({
      where: {
        cnpj: dados.cnpj,
      },
    });

    if (empresaExistente !== null) {
      console.log("Já existe uma empresa com o CNPJ informado");
      return { error: true, empresa: empresaExistente };
    } else {
      const novaEmpresa = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
        endereco: dados.endereco,
        cnpj: dados.cnpj,
        tag: dados.tag,
        logo: dados.logo,
        cor_primaria: dados.cor_primaria,
        cor_secundaria: dados.cor_secundaria,
      });
      return { error: false, empresa: novaEmpresa };
    }
  }

  // Pegar todas as empresas
  async pegaTodasEmpresas_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  // Pegar empresa por ID
  async pegaEmpresaPorId_Services(id) {
    return await devAgile[this.nomeModel].findByPk(id);
  }

  // Pegar empresa por tag
  async pegaEmpresaPorTag_Services(tag) {
    return await devAgile[this.nomeModel].findOne({ where: { tag: tag } });
  }

  // Deletar empresa por ID
  async deletaEmpresaPorId_Services(id) {
    const usuario = await devAgile.Usuario_Empresa.findAll({
      where: { empresa_id: id },
    });
    if (usuario.length) {
      return {
        error: true,
        message:
          "Essa empresa possui usuários vinculados, impossível excluí-la",
      };
    } else {
      const empresa = await devAgile[this.nomeModel].destroy({
        where: { id: id },
      });
      return {
        empresa: empresa,
        error: false,
        message: "Empresa deletada com sucesso",
      };
    }
  }

  // Atualizar empresa por ID
  async atualizaEmpresaPorId_Services(id, dados) {
    const empresa = await devAgile[this.nomeModel].findByPk(id);

    if (!empresa) {
      return null;
    }

    await empresa.update(dados);
    return empresa;
  }
}

module.exports = Empresa_Services;
