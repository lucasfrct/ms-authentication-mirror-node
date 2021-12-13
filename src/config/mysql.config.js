require('dotenv/config');
const { Sequelize } = require('sequelize');
const config = require('./config');


/**
 * Criando a classe e passando suas configurações
 * @param name: string
 * @param DB_NAME: string
 * @param DB_USER: string
 * @param DB_PASS: string
 * @param OPTIONS: any
 */

const MysqlDB = new Sequelize(
  process.env.DB_NAME,          // Carregando o nome do DB
  process.env.DB_USER,          // Carregando o usuario
  process.env.DB_PASS,          // Carregando a password do usuario
  {
    dialect:  process.env.DB_DIALECT,           // DB usado
    host:  process.env.DB_HOST  // Carregando o endereço do DB
  }
);

module.exports = MysqlDB;