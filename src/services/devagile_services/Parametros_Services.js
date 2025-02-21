const Services = require("../Services");
const { devAgile } = require("../../models");
const uuid = require("uuid");


class Parametros_Services extends Services{
  constructor() {
    super("Parametros");
  }
  // Pegar todos parametros
  async pegaTodosParametros_Services() {
    return await devAgile[this.nomeModel].findAll();
  }
  
  async criaParametros_Services(nome,empresa_id,descricao,tipo_id) {

     const parametroExiste = await devAgile[this.nomeModel].findOne({
          where: {
            name: nome,
          },
        });
        if (parametroExiste !== null) {
          return { error: true, parametro: parametroExiste, message:"Parametro já existe" };
        } else {
          const novoParametro = await devAgile[this.nomeModel].create({
            id:uuid.v4(),
            name:nome,
            empresa_id:empresa_id,
            descricao:descricao,
            tipo_id:tipo_id
          })
          return { error: false, parametro: novoParametro, message:"Parametro cadastrado co sucesso" };
        }
  }

  



}
module.exports = Parametros_Services