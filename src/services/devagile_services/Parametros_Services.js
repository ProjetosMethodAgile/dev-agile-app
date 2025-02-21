const Services = require("../Services");
const { devAgile } = require("../../models");
const uuid = require("uuid");
const { where } = require("sequelize");


class Parametros_Services extends Services {
  constructor() {
    super("Parametros");
  }
  // Pegar todos parametros
  async pegaTodosParametros_Services() {
    return await devAgile[this.nomeModel].findAll();
  }
  async criaParametros_Services(nome, empresa_id, descricao, tipo_id) {

    const parametroExiste = await devAgile[this.nomeModel].findOne({
      where: {
        name: nome,
      },
    });
    if (parametroExiste !== null) {
      return { error: true, parametro: parametroExiste, message: "Parametro já existe" };
    } else {
      const novoParametro = await devAgile[this.nomeModel].create({
        id: uuid.v4(),
        name: nome,
        empresa_id: empresa_id,
        descricao: descricao,
        tipo_id: tipo_id
      })
      return { error: false, parametro: novoParametro, message: "Parametro cadastrado co sucesso" };
    }
  }
  async deletaParametro(id) {
    const parametroExiste = await devAgile[this.nomeModel].findOne({
      where: {
        id: id,
      },
    });

    if (!parametroExiste) {
      return { error: true, parametro: parametroExiste, message: "Parametro não existe" };
    }
    const deletaParametro = await devAgile[this.nomeModel].destroy({
      where: {
        id: id,
      }

    })
    return { error: false, parametro: deletaParametro, message: "Parametro removido com sucesso" };




  }
  
  async atualizaParametros_Services(id, dados) {
    const parametro = await devAgile[this.nomeModel].findByPk(id);
    if (!parametro) {
      return null;
    }

    await parametro.update(dados);
    return parametro;
  }


async pegaIdParametro(id){
  const parametroExiste = await devAgile[this.nomeModel].findOne({
    where: {
      id: id,
    },
  });
  return { error: false, parametro: parametroExiste, message: "Consultado" };
}




}
module.exports = Parametros_Services