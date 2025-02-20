const Services = require("../Services");
const { devAgile } = require("../../models");


class Parametros_Services extends Services{
    
  // Pegar todos parametros
  async pegaTodosParametros_Services() {
    return await devAgile.Parametros.findAll();
  }


}
module.exports = Parametros_Services