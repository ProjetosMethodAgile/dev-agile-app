const Services = require("../Services");

class Parametros_Services extends Services{
    

  // Pegar todos parametros
  async pegaTodosParametros_Services() {
    return await devAgile[this.nomeModel].findAll();
  }


}
module.exports = Parametros_Services