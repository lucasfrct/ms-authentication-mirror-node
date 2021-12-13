const { Sequelize } = require('sequelize');
const MysqlDB = require("@config/mysql.config");

const UserSchema = {
    uid:        { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    uuid:       { type: Sequelize.STRING, allowNull: false },           // internal uuid
    ex_uuid:    { type: Sequelize.STRING, allowNull: true },            // external uuid
    email:      { type: Sequelize.STRING, allowNull: true },
    password:   { type: Sequelize.STRING, allowNull: true  },
    name:       { type: Sequelize.STRING, allowNull: true },
    cellphone:  { type: Sequelize.STRING, allowNull: true  },
};

const UserModel = MysqlDB.define('user', UserSchema, { timestamps: false });
module.exports = UserModel;