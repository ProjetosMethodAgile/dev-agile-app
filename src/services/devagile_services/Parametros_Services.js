const Services = require("../Services");
const uuid = require("uuid");
const { devAgile, sequelizeDevAgileCli } = require("../../models/index.js");


class Parametros_Services extends Services {
  constructor() {
    super("Parametros");
  }
  // Pegar todos parametros
  async pegaTodosParametros_Services() {
    return await devAgile[this.nomeModel].findAll();
  }

  async pegaParametrosEmpresa_Services(id){
    return await devAgile.EmpresaParametro.findOne(
      {where:{empresa_id:id}}
    )
  }

  
  async criaParametros_Services(nome, empresa_id, descricao, tipo_id) {
    const transaction = await sequelizeDevAgileCli.transaction();

    try {
      // Correção: Passa o objeto de transação separadamente
      const parametroExiste = await devAgile[this.nomeModel].findOne({
        where: { name: nome },
        transaction,
      });

      if (parametroExiste !== null) {
        await transaction.rollback();
        return { error: true, parametro: parametroExiste, message: "Parâmetro já existe" };
      }

      const novoParametro = await devAgile[this.nomeModel].create(
        {
          id: uuid.v4(),
          name: nome,
          empresa_id,
          descricao,
          tipo_id,
        },
        { transaction }
      );

      await novoParametro.addEmpresaParametros(empresa_id, { transaction });

      await transaction.commit();

      return { error: false, parametro: novoParametro, message: "Parâmetro cadastrado com sucesso" };
    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao criar parâmetro:", error);
      return { error: true, message: "Erro ao cadastrar parâmetro" };
    }
  }




  async deletaParametro_Services(id) {
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


async pegaIdParametro_Services(id){
  const parametroExiste = await devAgile[this.nomeModel].findOne({
    where: {
      id: id,
    },
  });
  return { error: false, parametro: parametroExiste, message: "Consultado" };
}




}
module.exports = Parametros_Services