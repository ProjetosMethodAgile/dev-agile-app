const express = require("express");
const routes = require("./routes/index.js"); // Importa as rotas
const { sequelizeDevAgileCli } = require("./config/config.js");

const app = express();

routes(app);

// Autenticação do banco de dados principal
sequelizeDevAgileCli
  .authenticate()
  .then(() => {
    console.log("Conexão com o DB-Devagile estabelecida com sucesso");
  })
  .catch((err) => {
    console.error("Não foi possível se conectar com o DB-Devagile", err);
  });

module.exports = app;
