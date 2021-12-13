'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      uid:        { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
      uuid:       { type: Sequelize.STRING, allowNull: false },           // internal uuid
      ex_uuid:    { type: Sequelize.STRING, allowNull: true },            // external uuid
      email:      { type: Sequelize.STRING, allowNull: true },
      password:   { type: Sequelize.STRING, allowNull: true  },
      name:       { type: Sequelize.STRING, allowNull: true },
      cellphone:  { type: Sequelize.STRING, allowNull: true  },
    });

  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.dropTable('users');
  }
};
