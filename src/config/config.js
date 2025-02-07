const { Sequelize } = require("sequelize");
const dbConfig = require("./database/db.js");

// Instância para o banco de dados AmalfisCli
const sequelizeDevAgileCli = new Sequelize(
  dbConfig.devAgile.database,
  dbConfig.devAgile.username,
  dbConfig.devAgile.password,
  {
    host: dbConfig.devAgile.host,
    port: dbConfig.devAgile.port,
    dialect: dbConfig.devAgile.dialect,
  }
);

// Instância para o banco de dados Sisplan
const sequelizeERP = new Sequelize(
  dbConfig.erp.database,
  dbConfig.erp.username,
  dbConfig.erp.password,
  {
    host: dbConfig.erp.host,
    port: dbConfig.erp.port,
    dialect: dbConfig.erp.dialect,
  }
);

module.exports = {
  sequelizeDevAgileCli,
  sequelizeERP,
};
