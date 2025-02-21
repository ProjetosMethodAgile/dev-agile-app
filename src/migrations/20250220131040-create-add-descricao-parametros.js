'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('parametros', 'descricao', {
      type: Sequelize.TEXT,
      allowNull: true
    });


    await queryInterface.addColumn('parametros', 'tipo_id', {
      type: Sequelize.UUID, 
      allowNull: false,
      references: {
        model: 'permissoes', 
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('parametros', 'descricao');
    await queryInterface.removeColumn('parametros', 'tipo_id');
  }
};
