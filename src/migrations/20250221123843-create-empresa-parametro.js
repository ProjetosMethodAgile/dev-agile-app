// migration de criação da tabela
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EmpresaParametros", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      empresa_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "empresas",
          key: "id",
        },
      },
      parametro_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "parametros",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("EmpresaParametros");
  },
};
