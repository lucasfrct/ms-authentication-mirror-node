const moduleAlias = require('module-alias');
const path = require('path');

const Aliases = {
    '@config': path.join(__dirname, './'),
    '@public': path.join(__dirname, '../public'),
    '@middleware': path.join(__dirname, '../middlewares'),
    '@authentication': path.join(__dirname, '../authentication'),
    '@routes': path.join(__dirname, '../routes'),
};

moduleAlias.addAliases(Aliases);
module.exports = moduleAlias();