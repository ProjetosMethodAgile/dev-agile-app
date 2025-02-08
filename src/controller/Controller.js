class Controller {
  constructor(nomeModel, campos) {
    this.nomeModel = nomeModel;
    this.camposObrigatorios = campos;
    this.camposVazios = [];
  }

  async allowNull(req, res) {
    this.camposVazios = []; // serve para nao acumular valores duplicados na array

    this.camposObrigatorios.forEach((campo) => {
      if (req.body[campo] == null || req.body[campo] === "") {
        this.camposVazios.push(campo);
      }
    });

    if (this.camposVazios.length === 0) {
      return { status: true };
    } else {
      return { status: false, campos: this.camposVazios };
    }
  }

  //-------------------------------------READ-------------------------------------//
}

module.exports = Controller;
