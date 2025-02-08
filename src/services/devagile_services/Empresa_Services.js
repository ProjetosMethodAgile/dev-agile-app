const Services = require("../Services.js");
const { devAgile } = require("../../models/index.js");
const uuid = require("uuid");

class Empresa_Services extends Services {
  constructor() {
    super("Empresa");
  }

  // Criar uma nova empresa
  async criaEmpresa_Services(dados) {
    const empresaExistente = await devAgile[this.nomeModel].findOne({
      where: {
        nome: dados.nome,
      },
    });

    if (empresaExistente !== null) {
      console.log("Já existe uma empresa com o nome informado");
      return { error: true, empresa: empresaExistente };
    } else {
      const novaEmpresa = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        nome: dados.nome,
        descricao: dados.descricao,
        endereco: dados.endereco,
        cnpj: dados.cnpj,
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

  // Deletar empresa por ID
  async deletaEmpresaPorId_Services(id) {
    const usuario = await devAgile.Usuario_Empresa.findAll({
      where: { empresa_id: id },
    });
    if (usuario.length) {
      return {
        error: true,
        message:
          "essa empresa possui usuarios vinculados, impossivel exclui-la ",
      };
    } else {
      const empresa = await devAgile[this.nomeModel].destroy({
        where: { id: id },
      });
      return {
        empresa: empresa,
        error: false,
        message: "empresa deletada com sucesso",
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
