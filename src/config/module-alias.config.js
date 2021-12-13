const moduleAlias = require('module-alias');
const path = require('path');

const Aliases = {
    '@config':  path.join(__dirname, './'),
    '@content':  path.join(__dirname, '../content'),
    '@middleware':  path.join(__dirname, '../middlewares'),
    '@ms-utils-node':  path.join(__dirname, '..', '..')
    // '@ms-utils-node':  path.join(__dirname, '..', '..', '..', 'olombongo-ms-utils-node'),

};

moduleAlias.addAliases(Aliases);
module.exports = moduleAlias();